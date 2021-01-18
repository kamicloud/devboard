import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import config from '../utils/configUtil';
import { Github } from 'src/type';

@Injectable()
export class GithubService {
  constructor(
    private configService: ConfigService
  ) {
  }

  public async commits(
    project,
    branch = 'master',
    takePage = 3
  ): Promise<Github.CommitsListResponseData> {
    const repositoryConfig = config.getRepositoryConfig(project);

    const octokit = new Octokit({
      auth: repositoryConfig.token,
    });

    let res = [];
    for (let page = 1; page <= takePage; page++) {
      const { data } = await octokit.repos.listCommits({
        owner: repositoryConfig.orgnization,
        repo: repositoryConfig.name,
        sha: branch,
        per_page: 100,
        page,
      });
      res = res.concat(data);
    }

    return res;
  }

  public async branches(project) {
    const repositoryConfig = config.getRepositoryConfig(project);

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

  public async releases(project) {
    const repositoryConfig = config.getRepositoryConfig(project);

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

  public async createBranch(project, branch, sha) {
    return await this.createRef(project, `heads/${branch}`, sha);
  }

  public async createRef(project, ref, sha) {
    const repositoryConfig = config.getRepositoryConfig(project);

    const octokit = new Octokit({
      auth: repositoryConfig.token,
    });

    const res = await octokit.git.createRef({
      owner: repositoryConfig.orgnization,
      repo: repositoryConfig.name,
      ref: `refs/${ref}`,
      sha,
    });

    return res;
  }
}
