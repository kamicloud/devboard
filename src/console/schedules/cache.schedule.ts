import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Logger } from "nestjs-pino";
import _ from 'lodash';
import { Console, Command, createSpinner, ConsoleService } from 'nestjs-console';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { JenkinsService } from '../../services/jenkins.service';
import { JiraService } from '../../services/jira.service';
import { GithubService } from '../../services/github.service';

type CacheType = Cache;

@Console({
  command: 'cache',
  description: 'tasks schedule',
})
@Injectable()
export class CacheSchedule {
  private temp = {};
  private notifyEnabled = {};
  private jiraActivitiesMap = {};

  private jiraLastRun: Date = new Date();

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly jenkinsService: JenkinsService,
    private readonly jiraService: JiraService,
    private readonly githubService: GithubService,
    @Inject(CACHE_MANAGER)
    private cacheManager: CacheType
  ) {
    this.jiraLastRun = new Date();
  }

  @Command({
    command: 'jenkins',
    description: 'Command for jenkins'
  })
  @Cron('*/10 * * * * *')
  async loadGithubBranches() {
    const branches = await this.githubService.branches('sincerely');

    await this.cacheManager.set('branches', branches, 1000000);
  }

  @Command({
    command: 'jira',
    description: 'Command for jenkins'
  })
  @Cron('*/10 * * * * *')
  async loadJiraActivities() {
  }
}
