import { Controller, Get, Query, Render, Param, Req } from '@nestjs/common';
import RepositoryUtil from '../utils/repositoryUtil';
import { Octokit } from '@octokit/rest';
import config from '../utils/configUtil';
import { AppService } from '../services/app.service';

@Controller('releases')
export class ReleaseController {
  constructor(private readonly appService: AppService) {}

  @Render('Releases')
  @Get()
  public async index(@Query('repository') repository: string) {
    const repositoryConfig = config.getRepositoryConfig(repository);

    const octokit = new Octokit({
      auth: repositoryConfig.token,
    });

    let remoteReleases = await octokit
      .paginate(octokit.repos.listReleases, {
        owner: repositoryConfig.orgnization,
        repo: repositoryConfig.name,
        per_page: 100,
      });

    remoteReleases = remoteReleases.sort((r1, r2) => {
      return r1.created_at < r2.created_at ? 1 : -1;
    })

    return {
      releases: remoteReleases,
    };
  }

  @Render('Commits')
  @Get(':repository/commits')
  public async commits(@Param() params, @Query('branch') branch?: string) {
    const repository = params.repository;
    const repositoryConfig = config.getRepositoryConfig(repository);
    if (!branch) {
      branch = 'master';
    }

    const octokit = new Octokit({
      auth: repositoryConfig.token,
    });

    const remote = await octokit.repos.listBranches({
      owner: repositoryConfig.orgnization,
      repo: repositoryConfig.name,
    });

    const remoteReleases = await octokit
      .paginate(octokit.repos.listReleases, {
        owner: repositoryConfig.orgnization,
        repo: repositoryConfig.name,
        per_page: 100,
      });

    const commits = await RepositoryUtil.getRepositoryCommits(repository, branch);
    return {
      releases: remoteReleases,
      branches: remote.data,
      commits: commits
    };
  }

  @Get(':repository/clone')
  public async clone(@Param() params, @Query('force') force?: boolean) {
    RepositoryUtil.cloneRepository(params.repository, force);

    return {
      message: 'please wait till it done',
    }
  }
}
