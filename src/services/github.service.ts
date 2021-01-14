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

  public async commits(repository, branch = 'master') {
    const repositoryConfig = config.getRepositoryConfig(repository);

    const octokit = new Octokit({
      auth: repositoryConfig.token,
    });

    const {data} = await octokit.repos.listCommits({
      owner: repositoryConfig.orgnization,
      repo: repositoryConfig.name,
      sha: branch,
    });

    return data;
  }

  public async branches(repository) {
    const repositoryConfig = config.getRepositoryConfig(repository);

    const octokit = new Octokit({
      auth: repositoryConfig.token,
    });

    const branches = await octokit
      .paginate(octokit.repos.listBranches, {
        owner: repositoryConfig.orgnization,
        repo: repositoryConfig.name,
        per_page: 100,
      });

    return branches;
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
