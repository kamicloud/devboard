import { Controller, Get, Post, Query, Render, Param, Req, Inject } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';
import config from '../../utils/configUtil';
import { GitDeployHistory } from '../../entities/GitDeployHistory.entity';
import { Repository } from 'typeorm';
import { Pages } from '../../pages';
import { GitHotfixedCommit } from '../../entities/GitHotfixedCommit.entity';

@Controller('api/deploy')
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

    const gitHotfixedCommits = await this.gitHotfixedCommitRepository.find({
      where: {
        repository: 'sincerely',
        parentBranch: branch,
      },
    });



    return {
      branches,
      commits,
      owner: repositoryConfig.orgnization,
      repository,
      branch,
      repositories,
      sites: repositoryConfig.sites,
      gitDeployHistories,
      gitHotfixedCommits,
    }
  }

  @Get('histories')
  public async histories(
    @Query('repository')
    repository: string,
    @Query('branch')
    branch: string = 'master',
    @Query('site')
    site: string
  ) {
    const gitDeployHistories = await this.gitDeployHistoryRepository
      .createQueryBuilder()
      .where('repository=:repository', { repository: 'sincerely' })
      .andWhere('branch=:branch', { branch })
      .andWhere('site_name=:siteName', { siteName: site })
      .andWhere('is_hidden=:isHidden', { isHidden: false })
      .orderBy('id', 'DESC')
      .limit(20)
      .getMany();

    return {
      gitDeployHistories
    }
  }

  @Get('pull')
  public async pullToStage() {

  }

  @Post()
  public async deploy() {

  }

  @Post('create-branch')
  public async createBranch() {

  }
}
