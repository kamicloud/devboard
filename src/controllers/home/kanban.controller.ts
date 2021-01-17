import { Controller, Get, Query, Render, Param, CACHE_MANAGER, Inject } from '@nestjs/common';
import { JiraService } from '../../services/jira.service';
import { Pages } from '../../pages';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../services/cache.service';
import _ from 'lodash';

@Controller('kanban')
export class KanbanController {

  constructor(
    private readonly jiraService: JiraService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService
  ) { }

  @Render('pages/kanban')
  @Get()
  public async index(): Promise<Pages.KanbanPageProps> {
    const groups = await this.jiraService.groups();
    const issues = await this.jiraService.search();
    const { endpoint, projectId } = this.configService.get<any>('jira');
    const branches = await this.cacheService.getbranches();

    return {
      common: {
        endpoint,
        projectId,
      },
      branches,
      groups,
      issues,
    };
  }
}
