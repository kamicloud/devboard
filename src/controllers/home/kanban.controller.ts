import { Controller, Get, Query, Render, Param } from '@nestjs/common';
import AWS from 'aws-sdk';
import Git from 'nodegit';
import { JiraService } from '../../services/jira.service';
import YAML from 'yamljs';
const { Octokit } = require("@octokit/rest");

@Controller('kanban')
export class KanbanController {

  constructor(private readonly jiraService: JiraService) {}

  @Render('Kanban')
  @Get()
  public async index() {

    const issues = await this.jiraService.search();

    return {
      issues
    };
  }
}
