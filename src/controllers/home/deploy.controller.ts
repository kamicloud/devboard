import { Controller, Get, Query, Render, Param, Req, Inject } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';
import { GitDeployHistory } from '../../entities/GitDeployHistory.entity';
import { Repository } from 'typeorm';
import { Pages } from '../../pages';
import { GitHotfixedCommit } from '../../entities/GitHotfixedCommit.entity';
import _ from 'lodash';
import { DeployManager } from '../../managers/deploy.manager';

@Controller('deploy')
export class DeployController {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService,
    private deployManager: DeployManager
  ) { }

  @Render('pages/deploy')
  @Get()
  public async index(
    @Query('project')
    project: string,
    @Query('branch')
    branch: string = 'master'
  ): Promise<Pages.DeployPageProps> {
    return await this.deployManager.index(project, branch);
  }
}
