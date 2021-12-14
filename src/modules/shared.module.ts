import { CacheModule, DynamicModule, Module } from '@nestjs/common';
import { JiraService } from '../services/jira.service';
import { AppService } from '../services/app.service';
import { ReleasesService } from '../services/releases.service';
import { JenkinsService } from '../services/jenkins.service';
import { GithubService } from '../services/github.service';
import { NodegitService } from '../services/nodegit.service';
import { CacheService } from '../services/cache.service';
import ConfigUtil from '../utils/config.util';
import { DatabaseService } from 'src/services/database.service';
import { JiraApiService } from '../services/jira-api.service';
import { AwsSdkService } from '../services/aws-sdk.service';

const providers = [
  AppService,
  CacheService,
  GithubService,
  JenkinsService,
  JiraService,
  NodegitService,
  ReleasesService,
  DatabaseService,
  AwsSdkService,
  JiraApiService,
  ConfigUtil,
];

@Module({
  imports: [
    CacheModule.register(),
  ],
  providers,
  exports: providers,
})
export class SharedModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: SharedModule,
      providers,
      exports: providers,
    };
  }
}
