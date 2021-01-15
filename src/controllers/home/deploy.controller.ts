import { Controller, Get, Query, Render, Param, Req, Inject } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';
import config from '../../utils/configUtil';
import { GitDeployHistory } from '../../entities/GitDeployHistory.entity';
import { Repository } from 'typeorm';
import { Pages } from '../../pages';
import { GitHotfixedCommit } from '../../entities/GitHotfixedCommit.entity';
import _ from 'lodash';

@Controller('deploy')
export class DeployController {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService,
    @Inject('GIT_DEPLOY_HISTORY_REPOSITORY')
    private gitDeployHistoryRepository: Repository<GitDeployHistory>,
    @Inject('GIT_HOTFIXED_COMMIT_REPOSITORY')
    private gitHotfixedCommitRepository: Repository<GitHotfixedCommit>,
  ) { }

  @Render('pages/deploy')
  @Get()
  public async index(
    @Query('repository')
    repository: string,
    @Query('branch')
    branch: string = 'master'
  ): Promise<Pages.DeployPageProps> {
    const branches = await this.githubService.branches(repository);
    const commits = await this.githubService.commits(repository, branch);
    const repositoryConfig = config.getRepositoryConfig(repository);
    const repositories = [
      repository,
    ];

    const gitHotfixedCommits = (await this.gitHotfixedCommitRepository.find({
      where: {
        repository: 'sincerely',
      },
    })).map(gitHotfixedCommit => {
      gitHotfixedCommit.branch = (gitHotfixedCommit.isTemp ? 'tempbranches/' : 'hotfixes/') + gitHotfixedCommit.sha.substr(0, 7);
      return gitHotfixedCommit;
    });
    const gitDeployHistories = await this.gitDeployHistoryRepository.find({
      where: {
        repository: 'sincerely',
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
      repository,
      branch,
      repositories,
      sites: repositoryConfig.sites,
      gitDeployHistories,
      gitHotfixedCommits: gitHotfixedCommits.filter(gitHotfixedCommit => {
        return gitHotfixedCommit.parentBranch === branch;
      }),
    }
  }
}
