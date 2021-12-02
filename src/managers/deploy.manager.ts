import { Controller, Get, Query, Render, Param, Req, Inject, Injectable } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { NodegitService } from '../services/nodegit.service';
import { GithubService } from '../services/github.service';
import ConfigUtil from '../utils/config.util';
import { Pages } from '../pages';
import _ from 'lodash';
import { DatabaseService } from 'src/services/database.service';

@Injectable()
export class DeployManager {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService,
    private configUtil: ConfigUtil,
    private databaseService: DatabaseService,
  ) { }

  public async index(
    project: string,
    branch = 'master'
  ): Promise<Pages.DeployPageProps> {
    const branches = await this.githubService.branches(project);
    const commits = await this.githubService.commits(project, branch);
    const repositoryConfig = this.configUtil.getRepositoryConfig(project);
    const projects = [
      project,
    ];

    const gitHotfixedCommits = await this.databaseService.getHotfixedCommits(project);
    const gitDeployHistories = await this.databaseService.getLatestDeployHistories(project, branch);

    const hotfixedGroupByBranch = _.keyBy(gitHotfixedCommits.map(gitHotfixedCommit => {
      gitHotfixedCommit.branch = (gitHotfixedCommit.isTemp ? 'tempbranches/' : 'hotfixes/') + gitHotfixedCommit.sha.substr(0, 7);
      return gitHotfixedCommit;
    }), 'branch');
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
