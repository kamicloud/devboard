import { Controller, Get, Query, Render, Param, Req } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import config from '../../utils/configUtil';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';

@Controller('releases')
export class ReleaseController {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService
  ) {}

  @Render('releases')
  @Get()
  public async index(
    @Query('repository')
    repository: string
  ) {
    let releases = await this.githubService.releases(repository);

    releases = releases.sort((r1, r2) => {
      return r1.created_at < r2.created_at ? 1 : -1;
    })

    return {
      releases,
    };
  }

  @Render('commits')
  @Get(':repository/commits')
  public async commits(
    @Param()
    params,
    @Query('branch')
    branch?: string
  ) {
    const repository = params.repository;

    if (!branch) {
      branch = 'master';
    }

    const branches = await this.githubService.branches(repository);
    const commits = await this.nodegitService.getRepositoryCommits(repository, branch);

    return {
      branch,
      branches,
      commits,
    };
  }

  @Get(':repository/clone')
  public async clone(
    @Param()
    params,
    @Query('force')
    force?: boolean
  ) {
    this.nodegitService.cloneRepository(params.repository, force);

    return {
      message: 'please wait till it done',
    }
  }
}
