import { Version3Client } from 'jira.js';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import {
  Component,
  ComponentIssuesCount,
  Issue,
  IssueTransition,
  Project,
  Transitions
} from 'jira.js/out/version3/models';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { FrontendComponents } from './jira-const';
import { Logger } from 'nestjs-pino';
import { AwsSdkService } from './aws-sdk.service';

@Injectable()
export class JiraApiService implements OnModuleInit{
  private static client: Version3Client;
  private static token: string;
  constructor(
    private readonly logger: Logger,
    private readonly aws: AwsSdkService
  ) {}

  async onModuleInit(): Promise<any> {
    if (process.env.AWS_USE_ENV_CREDENTIALS == 'false') {
      await this.aws.loadLocalCredentials();
    }
    await this.loadToken();
  }

  private async loadToken() {
    try {
      const result = await this.aws.getJiraToken();
      JiraApiService.token = result.Parameter.Value;
    } catch (err) {
      this.logger.log('getJiraToken ERROR', err)
      throw new Error('loadToken Error:' + err.message)
    }
  }

  public getClient(): Version3Client {
    if (isEmpty(JiraApiService.client)) {
      JiraApiService.client = new Version3Client({
        host: process.env.JIRA_ENDPOINT,
        authentication: {
          basic: {
            email: process.env.JIRA_USERNAME,
            apiToken: JiraApiService.token,
          }
        }
      });
    }
    return JiraApiService.client;
  }

  public getIssue(key: string): Promise<Issue> {
    return this.getClient().issues.getIssue({issueIdOrKey: key});
  }

  public async matchUnsolvedIssues(keys, coms: string[]):Promise<string[]> {
    coms = coms.map(com => `"${com}"`);
    const frontComs = FrontendComponents.map(com => `"${com}"`);
    const jql = `key in (${keys}) AND statusCategory != Done AND component in (${coms}) AND component not in (${frontComs})`;
    this.logger.log(`jql====${jql}`)
    try {
      const result = await this.getClient().issueSearch.searchForIssuesUsingJql({jql})
      return result.issues.map(issue => issue.key);
    } catch (e) {
      this.logger.error(e)
      return [];
    }
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

  public getComponent(id: string): Promise<Component> {
    return this.getClient().projectComponents.getComponent({id});
  }

  public getProjectComponents(projectKey: string): Promise<Component[]> {
    return this.getClient().projectComponents.getProjectComponents({projectIdOrKey: projectKey})
  }

  public getComponentRelatedIssues(id: string): Promise<ComponentIssuesCount> {
    return this.getClient().projectComponents.getComponentRelatedIssues({id})
  }

  public async setIssueResolved(key: string): Promise<boolean> {
    return await this.setIssueTransition(key);
  }

  private async setIssueTransition(key: string):Promise<boolean> {
    try {
      const trans = await this.getTransitions(key);
      const ops = trans.transitions.filter(tran => tran.to.name == 'Resolved');
      if (isEmpty(ops)) return false;

      await this.doTransition(key, ops[0]);
    } catch (e) {
      this.logger.log('setIssueTransition FAILED====', e);
      return false;
    }

    return true;
  }


}
