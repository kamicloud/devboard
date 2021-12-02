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
import { Injectable } from '@nestjs/common';
import { FrontendComponents, IssueTransitionOperation } from './jira-const';
import { Logger } from 'nestjs-pino';

@Injectable()
export class JiraApiService {
  private static client: Version3Client;

  constructor(private readonly logger: Logger) {}

  public getClient(): Version3Client {
    if (isEmpty(JiraApiService.client)) {
      JiraApiService.client = new Version3Client({
        host: process.env.JIRA_ENDPOINT,
        authentication: {
          basic: {
            email: process.env.JIRA_USERNAME,
            apiToken: process.env.JIRA_TOKEN,
            // username: process.env.JIRA_USERNAME,
            // password: process.env.JIRA_PASSWORD,
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
    await this.setIssueTransition(key, IssueTransitionOperation.START_PROGRESS);
    return await this.setIssueTransition(key, IssueTransitionOperation.RESOLVE_ISSUE);
  }

  private async setIssueTransition(key: string, transOp: IssueTransitionOperation):Promise<boolean> {
    try {
      const trans = await this.getTransitions(key);
      const ops = trans.transitions.filter(tran => tran.name == transOp);
      if (isEmpty(ops)) return false;

      await this.doTransition(key, ops[0]);
    } catch (e) {
      this.logger.log('setIssueTransition FAILED====', e);
      return false;
    }

    return true;
  }


}
