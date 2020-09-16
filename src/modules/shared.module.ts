import { Module } from '@nestjs/common';
import { JiraService } from '../services/jira.service';
import { AppService } from '../services/app.service';
import { ReleasesService } from '../services/releases.service';
import { JenkinsService } from '../services/jenkins.service';

@Module({
  providers: [
    ReleasesService,
    AppService,
    JenkinsService,
    JiraService,
  ],
  exports: [
    ReleasesService,
    AppService,
    JenkinsService,
    JiraService,
  ],
})
export class SharedModule {}
