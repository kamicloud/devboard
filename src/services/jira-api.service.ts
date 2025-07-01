import {Version3Client} from 'jira.js';
import {isEmpty} from '@nestjs/common/utils/shared.utils';
import {IssueTransition, Transitions} from 'jira.js/out/version3/models';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {FrontendComponents, IssueTransitionStatus} from './jira-const';
import {Logger} from 'nestjs-pino';
import {AwsSdkService} from './aws-sdk.service';

@Injectable()
export class JiraApiService implements OnModuleInit{
  private static client: Version3Client;
  private static token: string;
  constructor(
    private readonly logger: Logger,
    private readonly aws: AwsSdkService
  ) {}

  async onModuleInit(): Promise<any> {
    if (process.env.AWS_USE_ENV_CREDENTIALS === 'false') {
      await this.aws.loadLocalCredentials();

      return;
    }
    await this.loadToken();
  }

  private async loadToken() {
    if (process.env.JIRA_API_USE_ENV_TOKEN === 'true') {
      JiraApiService.token = process.env.JIRA_API_TOKEN;
      return;
    }

    try {
      const result = await this.aws.getJiraToken();
      JiraApiService.token = result.Parameter.Value
      console.log('AWS Jira Token:', JiraApiService.token)
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
            email: process.env.JIRA_API_USERNAME,
            apiToken: JiraApiService.token,
          }
        },
        newErrorHandling: true
      });
    }
    return JiraApiService.client;
  }

  public async matchUnsolvedIssues(keys, coms: string[]):Promise<string[]> {
    coms = coms.map(com => `"${com}"`);
    const frontComs = FrontendComponents.map(com => `"${com}"`);
    const jql = `key in (${keys}) AND statusCategory != Done AND status = "Verified Master PRE" AND component in (${coms}) AND component not in (${frontComs})`;
    this.logger.log(`jql====${jql}`)
    try {
      const result = await this.getClient().issueSearch.searchForIssuesUsingJql({jql})
      return result.issues.map(issue => issue.key);
    } catch (e) {
      this.logger.error(e)
      return [];
    }
  }

  public doTransition(key: string, transition: IssueTransition): Promise<void> {
    return this.getClient().issues.doTransition({issueIdOrKey: key, transition});
  }

  public getTransitions(key: string): Promise<Transitions> {
    return this.getClient().issues.getTransitions({issueIdOrKey: key});
  }

  public async setIssueResolved(key: string): Promise<boolean> {
    // await this.setIssueTransition(key, IssueTransitionStatus.IN_PROGRESS);
    return await this.setIssueTransition(key, IssueTransitionStatus.RESOLVED);
  }

  private async setIssueTransition(key: string, status: IssueTransitionStatus):Promise<boolean> {
    try {
      const trans = await this.getTransitions(key);
      const ops = trans.transitions.filter(tran => tran.to.name == status);
      if (isEmpty(ops)) return false;

      await this.doTransition(key, ops[0]);
    } catch (e) {
      this.logger.log('setIssueTransition FAILED====', e);
      return false;
    }

    return true;
  }
}
