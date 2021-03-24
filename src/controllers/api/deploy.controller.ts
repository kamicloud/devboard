import { Controller, Get, Post, Delete, Query, Render, Param, Req, Inject } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';
import ConfigUtil from '../../utils/config.util';
import { Pages } from '../../pages';
import _ from 'lodash';
import { DeployManager } from '../../managers/deploy.manager';
import { DatabaseService } from 'src/services/database.service';

@Controller('api/deploy')
export class DeployController {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService,
    private deployManager: DeployManager,
    private configUtil: ConfigUtil,
    private databaseService: DatabaseService,
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
    const repositoryConfig = this.configUtil.getRepositoryConfig(project);

    const gitDeployHistories = await this.databaseService.getDeployHistories(
      project,
      branch,
      site,
      repositoryConfig.sites
    );

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
