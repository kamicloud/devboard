import { Controller, Get, Query, Render, Param, Req } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';
import { JiraService } from '../../services/jira.service';

@Controller('api/kanban')
export class KanbanController {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly jiraService: JiraService,
    private readonly nodegitService: NodegitService
  ) {}

  @Get('group_members')
  public async index(
    @Query('id')
    id?: string
  ) {
    const groupMembers = id ? await this.jiraService.groupMembers(id) : []

    return {
      message: 'success',
      groupMembers,
    };
  }

  @Get('issues')
  public async issues(
    @Query('assignee')
    assignee?: string
  ) {
    const issues = await this.jiraService.search(assignee)

    return {
      message: 'success',
      issues,
    };
  }

}
