import { Controller, Get, Query, Render, Param, Req, Inject, Injectable } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { NodegitService } from '../services/nodegit.service';
import { GithubService } from '../services/github.service';
import ConfigUtil from '../utils/config.util';
import { GitDeployHistory } from '../entities/GitDeployHistory.entity';
import { getManager } from 'typeorm';
import { Pages } from '../pages';
import { GitHotfixedCommit } from '../entities/GitHotfixedCommit.entity';
import _ from 'lodash';

@Injectable()
export class DeployManager {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService,
    private configUtil: ConfigUtil,
  ) { }

  public async index(
    project: string,
    branch: string = 'master'
  ): Promise<Pages.DeployPageProps> {
    const branches = await this.githubService.branches(project);
    const commits = await this.githubService.commits(project, branch);
    const repositoryConfig = this.configUtil.getRepositoryConfig(project);
    const projects = [
      project,
    ];

    const entityManager = getManager();
    const gitHotfixedCommits = (await entityManager.getRepository(GitHotfixedCommit)
      .find({
        where: {
          repository: project,
        },
      })).map(gitHotfixedCommit => {
        gitHotfixedCommit.branch = (gitHotfixedCommit.isTemp ? 'tempbranches/' : 'hotfixes/') + gitHotfixedCommit.sha.substr(0, 7);
        return gitHotfixedCommit;
      });

    const gitDeployHistories = await entityManager
      .getRepository(GitDeployHistory)
      .find({
        where: {
          repository: project,
          branch,
        },
        order: {
          id: 'DESC'
        },
        take: 1000,
      });

    const hotfixedGroupByBranch = _.keyBy(gitHotfixedCommits, 'branch');
    let filterHotfix = false;

    return {
      project,
      branches,
      commits: commits.filter((commit) => {
        if (hotfixedGroupByBranch[branch]) {
          if (filterHotfix || hotfixedGroupByBranch[branch].sha === commit.sha) {
            filterHotfix = true;

            return false;
          }
        }
        return true;
      }),
      owner: repositoryConfig.orgnization,
      repository: repositoryConfig.name,
      branch,
      projects,
      sites: repositoryConfig.sites,
      gitDeployHistories,
      gitHotfixedCommits: gitHotfixedCommits.filter(gitHotfixedCommit => {
        return gitHotfixedCommit.parentBranch === branch;
      }),
    }
  }
}
