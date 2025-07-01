import { CacheModule, DynamicModule, Module } from '@nestjs/common';
import { JenkinsService } from '../services/jenkins.service';
import { NodegitService } from '../services/nodegit.service';
import ConfigUtil from '../services/config.util';
import { DatabaseService } from 'src/services/database.service';
import { JiraApiService } from '../services/jira-api.service';
import { AwsSdkService } from '../services/aws-sdk.service';

const providers = [
  JenkinsService,
  NodegitService,
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
