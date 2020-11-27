import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import config from '../utils/configUtil';

@Injectable()
export class GithubService {
  constructor(
    private configService: ConfigService
  ) {
  }

  public async branches(repository) {
    const repositoryConfig = config.getRepositoryConfig(repository);

    const octokit = new Octokit({
      auth: repositoryConfig.token,
    });

    const remote = await octokit.repos.listBranches({
      owner: repositoryConfig.orgnization,
      repo: repositoryConfig.name,
    });

    return remote.data;
  }

  public async releases(repository) {
    const repositoryConfig = config.getRepositoryConfig(repository);

    const octokit = new Octokit({
      auth: repositoryConfig.token,
    });

    const releases = await octokit
      .paginate(octokit.repos.listReleases, {
        owner: repositoryConfig.orgnization,
        repo: repositoryConfig.name,
        per_page: 100,
      });

    return releases;
  }
}
