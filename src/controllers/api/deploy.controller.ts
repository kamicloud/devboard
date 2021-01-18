import { Controller, Get, Post, Delete, Query, Render, Param, Req, Inject } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';
import config from '../../utils/configUtil';
import { GitDeployHistory } from '../../entities/GitDeployHistory.entity';
import { Repository, Brackets } from 'typeorm';
import { Pages } from '../../pages';
import { GitHotfixedCommit } from '../../entities/GitHotfixedCommit.entity';
import _ from 'lodash';
import { DeployManager } from '../../managers/deploy.manager';

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
    private deployManager: DeployManager
  ) { }

  @Get()
  public async index(
    @Query('project')
    project: string,
    @Query('branch')
    branch: string = 'master'
  ): Promise<Pages.DeployPageProps> {
    return await this.deployManager.index(project, branch);
  }

  @Get('histories')
  public async histories(
    @Query('project')
    project: string,
    @Query('branch')
    branch: string,
    @Query('site')
    site: string
  ) {
    const repositoryConfig = config.getRepositoryConfig(project);

    const gitDeployHistories = await this.gitDeployHistoryRepository
      .createQueryBuilder()
      .where(new Brackets(qb => {
        qb.andWhere('repository=:repository', { repository: project })
        qb.andWhere('site_name=:siteName', { siteName: site });
        if (repositoryConfig.sites.live.indexOf(site) === -1) {
          qb.andWhere('branch=:branch', { branch })
        }
        qb.andWhere('is_hidden=:isHidden', { isHidden: false })
      }))
      .orderBy('id', 'DESC')
      .limit(20)
      .getMany();

    return {
      gitDeployHistories
    }
  }

  @Post('pull')
  public async pullToStage(
    @Param('project')
    project: string,
    @Param('branch')
    branch: string
  ) {
  }

  @Post()
  public async deploy(
    @Param('project')
    project: string,
    @Param('branch')
    branch: string,
    @Param('site')
    site: string
  ) {

  }

  @Post('create-branch')
  public async createBranch(
    @Param('project')
    project: string,
    @Param('branch')
    branch: string
  ) {

  }

  @Delete('delete-branch')
  public async deleteBranch(
    @Param('project')
    project: string,
    @Param('branch')
    branch: string
  ) {

  }
}
