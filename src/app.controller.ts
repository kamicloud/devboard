import { Controller, Get, Query, Render, Param } from '@nestjs/common';
import AWS from 'aws-sdk';
import Git from 'nodegit';
import RepositoryUtil from './utils/repositoryUtil';
import YAML from 'yamljs';

@Controller()
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
  @Get(':repository/:branch/commits')
  public async commits(@Param() params) {
    const repository = params.repository;
    const commits = await RepositoryUtil.getRepositoryCommits(repository, params.branch);
    return {
      commits: commits
    };
  }

  @Get(':repository/clone')
  public async clone(@Param() params) {
    await RepositoryUtil.cloneRepository(params.repository);

    return {
      message: 'success',
    }
  }
}
