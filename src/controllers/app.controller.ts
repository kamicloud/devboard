import { Controller, Get, Query, Render, Param } from '@nestjs/common';
import { GithubService } from '../services/github.service';
import { NodegitService } from '../services/nodegit.service';

@Controller('app')
export class AppController {
  constructor(
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService
  ) {
  }

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
}
