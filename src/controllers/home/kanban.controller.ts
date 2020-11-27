import { Controller, Get, Query, Render, Param } from '@nestjs/common';
import { JiraService } from '../../services/jira.service';
import { Pages } from '../../pages';

@Controller('kanban')
export class KanbanController {

  constructor(private readonly jiraService: JiraService) { }

  @Render('Kanban')
  @Get()
  public async index(): Promise<Pages.KanbanPageProps> {
    const issues = await this.jiraService.search();

    return {
      issues
    };
  }
}
