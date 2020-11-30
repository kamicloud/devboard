import { CacheModule, Module } from '@nestjs/common';
import { JiraService } from '../services/jira.service';
import { AppService } from '../services/app.service';
import { ReleasesService } from '../services/releases.service';
import { JenkinsService } from '../services/jenkins.service';
import { GithubService } from '../services/github.service';
import { NodegitService } from '../services/nodegit.service';
import { CacheService } from '../services/cache.service';

@Module({
  imports: [
    CacheModule.register(),
  ],
  providers: [
    AppService,
    CacheService,
    GithubService,
    JenkinsService,
    JiraService,
    NodegitService,
    ReleasesService,
  ],
  exports: [
    AppService,
    CacheService,
    GithubService,
    JenkinsService,
    JiraService,
    NodegitService,
    ReleasesService,
  ],
})
export class SharedModule {}
