import { Controller, Get, Query, Render, Param, Req } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import config from '../../utils/configUtil';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';

@Controller('api/releases')
export class ReleaseController {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService
  ) {}

  @Get('pull')
  public async index(
    @Query('repository')
    repository: string,
    @Query('branch')
    branch?: string
  ) {
    await this.nodegitService.fetchAndPull(repository);
    const commits = await this.nodegitService.getRepositoryCommits(repository, branch ? branch : 'master');

    return {
      message: 'success',
      commits,
    };
  }
}
