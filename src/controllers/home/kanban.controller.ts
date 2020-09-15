import { Controller, Get, Query, Render, Param } from '@nestjs/common';
import AWS from 'aws-sdk';
import Git from 'nodegit';
import YAML from 'yamljs';
const { Octokit } = require("@octokit/rest");

@Controller('kanban')
export class KanbanController {
  @Render('Kanban')
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
