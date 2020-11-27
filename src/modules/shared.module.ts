import { Module } from '@nestjs/common';
import { JiraService } from '../services/jira.service';
import { AppService } from '../services/app.service';
import { ReleasesService } from '../services/releases.service';
import { JenkinsService } from '../services/jenkins.service';
import { GithubService } from '../services/github.service';
import { NodegitService } from '../services/nodegit.service';

@Module({
  providers: [
    AppService,
    GithubService,
    JenkinsService,
    JiraService,
    NodegitService,
    ReleasesService,
  ],
  exports: [
    AppService,
    GithubService,
    JenkinsService,
    JiraService,
    NodegitService,
    ReleasesService,
  ],
})
export class SharedModule {}
