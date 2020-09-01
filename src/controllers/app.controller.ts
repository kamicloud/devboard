import { Controller, Get, Query, Render, Param } from '@nestjs/common';
import AWS from 'aws-sdk';
import Git from 'nodegit';
import RepositoryUtil from '../utils/repositoryUtil';
import YAML from 'yamljs';
const { Octokit } = require("@octokit/rest");
import config from '../utils/configUtil';

@Controller('app')
export class AppController {
  @Render('Index')
  @Get()
  public index(@Query('name') name?: string) {

    // AWS.config.loadFromPath(__dirname + '/../.access.json');
    // var ec2 = new AWS.EC2();

    // ec2.describeInstances({}, (error, result) => {
    //     console.log(error, result)
    // });
    return { name };
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
    // console.log(remote.data);

    const remoteReleases = await octokit
      .paginate(octokit.repos.listReleases, {
        owner: repositoryConfig.orgnization,
        repo: repositoryConfig.name,
        per_page: 100,
      });

    // console.log(remoteReleases);
    console.log(remoteReleases.map(release => release.name).filter((r) => r.startsWith('preview')).sort().reverse(), remoteReleases[0])

    const commits = await RepositoryUtil.getRepositoryCommits(repository, branch);
    return {
      tags: remoteReleases.data,
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
