import { Version3Client } from 'jira.js';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import { Issue, IssueTransition, Project, Transition, Transitions } from 'jira.js/out/version3/models';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JiraApiService {
  private client: Version3Client;
  public getClient(): Version3Client {
    if (isEmpty(this.client)) {
      this.client = new Version3Client({
        host: process.env.JIRA_ENDPOINT,
        authentication: {
          basic: {
            username: process.env.JIRA_USERNAME,
            password: process.env.JIRA_PASSWORD,
          }
        }
      });
    }
    return this.client;
  }

  public getIssue(key: string): Promise<Issue> {
    return this.getClient().issues.getIssue({issueIdOrKey: key});
  }

  public getProject(key: string): Promise<Project> {
    return this.getClient().projects.getProject({projectIdOrKey: key});
  }

  public doTransition(key: string, transition: IssueTransition): Promise<void> {
    return this.getClient().issues.doTransition({issueIdOrKey: key, transition});
  }

  public getTransitions(key: string): Promise<Transitions> {
    return this.getClient().issues.getTransitions({issueIdOrKey: key});
  }
}
