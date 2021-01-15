import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Logger } from "nestjs-pino";
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Github } from '../type';
import { JiraService } from './jira.service';
import { JenkinsService } from './jenkins.service';
import { GithubService } from './github.service';

@Injectable()
export class CacheService {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly jenkinsService: JenkinsService,
    private readonly jiraService: JiraService,
    private readonly githubService: GithubService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {
  }

  async getbranches(): Promise<Github.ReposListBranchesResponseData> {
    const branches = await this.cacheManager.get('branches');

    if (!branches) {
      return [];
    }

    return branches;
  }
}
