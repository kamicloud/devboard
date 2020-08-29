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
  @Get(':repository/commits')
  public async commits(@Param() params) {
    const repository = params.repository;
    const commits = await RepositoryUtil.getRepositoryCommits(repository, 'master');
    return {
      commits: commits
    };
  }

  /**
   * name
   */
  public async name() {
    await RepositoryUtil.cloneRepository(
      'https://github.com/kamicloud/stub-api'
    );
  }
}
