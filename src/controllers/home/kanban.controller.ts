import { Controller, Get, Query, Render, Param } from '@nestjs/common';
import { JiraService } from '../../services/jira.service';
import { Pages } from '../../pages';
import { ConfigService } from '@nestjs/config';

@Controller('kanban')
export class KanbanController {

  constructor(
    private readonly jiraService: JiraService,
    private readonly configService: ConfigService
  ) { }

  @Render('Kanban')
  @Get()
  public async index(): Promise<Pages.KanbanPageProps> {
    const groups = await this.jiraService.groups();
    const issues = await this.jiraService.search();
    const { endpoint, projectId } = this.configService.get<any>('jira');

    return {
      common: {
        endpoint,
        projectId,
      },
      groups,
      issues,
    };
  }
}
