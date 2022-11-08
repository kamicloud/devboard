import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { NodegitService } from '../../services/nodegit.service';
import ConfigUtil from '../../utils/config.util';
import { JiraApiService } from '../../services/jira-api.service';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import { trimEnd } from 'lodash';
import { BackendComponents } from '../../services/jira-const';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AwsSdkService } from '../../services/aws-sdk.service';

@Console({
  command: 'jira',
  description: 'jira schedule',
})
@Injectable()
export class JiraSchedule {
  public static PROJECT_NAME = 'sincerely';
  public static PROJECT_PREFIX = 'SA-';
  public static PROJECT_COMPONENT = {
    'snapi': [BackendComponents.BACKEND_INK],
    'snapi-eu': [BackendComponents.BACKEND_FC],
    'snapi-gifting': [BackendComponents.BACKEND_GIFTING],
    'snapi-admin': [BackendComponents.BACKEND_ADMIN_NEW],
    'worker': [BackendComponents.BACKEND_ASSET_GEN, BackendComponents.BACKEND_SEND_TO_PRINT],
    'worker-eu': [BackendComponents.BACKEND_ASSET_GEN, BackendComponents.BACKEND_SEND_TO_PRINT],
    'runner': [],
    'runner-eu': [],
    'preview' : [BackendComponents.BACKEND_PREVIEW],
    'preview-eu': [BackendComponents.BACKEND_PREVIEW],
    'preview-gifting': [BackendComponents.BACKEND_PREVIEW],
  }

  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly configUtil: ConfigUtil,
    private readonly git: NodegitService,
    private readonly jira: JiraApiService,
    private readonly aws: AwsSdkService,
  ) {}

  @Command({
    command: 'check-release',
    description: 'Check unsolved issues of released version'
  })
  @Cron(CronExpression.EVERY_MINUTE)
  @logExecTime()
  public async checkRelease() {
    console.log('Start Checking Jira Tickets=====');
    await this.git.fetchAndPull(JiraSchedule.PROJECT_NAME);
    this.logger.log('Fetch done...');

    const repoConfig = this.configUtil.getRepositoryConfig(JiraSchedule.PROJECT_NAME)
    const liveSites = repoConfig.sites.live;
    for (const site of liveSites) {
      await this.checkSiteRelease(site);
    }
  }

  @logExecTime()
  @Command({
    command: 'checksite <site>'
  })
  private async checkSiteRelease(site) {
    this.logger.log(`=================Start to check [${site}]=====================`);

    const issueKeys = await this.getIssueKeys(site);
    this.logger.log(`${site} updated issues====[${issueKeys}]`)
    if (isEmpty(issueKeys)) return;

    const keys = await this.filterByComponent(site, issueKeys);
    this.logger.log(`${site} is going to resolve tickets======[${keys}]`)
    if (isEmpty(keys)) return;

    for (const key of keys) {
      const ok = await this.jira.setIssueResolved(key);
      this.logger.log(`Resolving [${key}] ${ok ? '==succeeded==' : '==failed=='}`)
    }
  }

  private async filterByComponent(site, issueKeys): Promise<any[]> {
    const coms = JiraSchedule.PROJECT_COMPONENT[site];
    if (isEmpty(coms)) return [];
    const comNames = coms.map(com => com.name)
    return await this.jira.matchUnsolvedIssues(issueKeys, comNames)
  }

  @Command({
    command: 'component <site>'
  })
  private async getComponent(site) {
    const coms = JiraSchedule.PROJECT_COMPONENT[site];
    if (isEmpty(coms)) return null;

    try {
      for (const com of coms) {
        const component = await this.jira.getComponent(com.id)
        console.log(component);
      }
    } catch (e) {
      console.log(e)
    }
  }

  @Command({
    command: 'components <project>'
  })
  private async getComponents(project) {
    const components = await this.jira.getProjectComponents(project);
    console.log(components);
  }

  @Command({
    command: 'get-issues <site>'
  })
  private async getIssueKeys(site) {
    const tagStr = await this.git.getRecentTags(JiraSchedule.PROJECT_NAME, `${site}-v*`, 5);
    if (isEmpty(tagStr)) {
      this.logger.error(`NO TAGS AT ALL.`);
      return;
    }
    const tags = trimEnd(tagStr, '\n').split('\n');
    this.logger.log(`${site} recent tags === [${tags}]`);
    if (tags.length < 2) {
      this.logger.error('ONLY ONE TAGS');
      return;
    }

    const from = tags.pop();
    const to = tags.shift();
    const logStr = await this.git.logsBetweenTags(JiraSchedule.PROJECT_NAME, from, to);
    const issueKeys = this.git.parseLogStr(logStr);
    this.logger.log(`GetIssueKeys From [${from}] to [${to}]====[${issueKeys}]`, site);

    return issueKeys.map(key => JiraSchedule.PROJECT_PREFIX + key);
  }

  @Command({
    command: 'resolve <key>',
    description: 'resolve issue',
  })
  public async resolveIssue(key) {
    await this.jira.setIssueResolved(key);
  }

  @Command({
    command: 'gitpull',
  })
  private async gitPull() {
    this.logger.log('start pull...');
    await this.git.fetchAndPull(JiraSchedule.PROJECT_NAME);
    this.logger.log('end pull...');
  }

  @Command({
    command: 'match <site>'
  })
  private async testMatch(site) {
    const issueKeys = ['SA-16940'];
    try {
      const keys = await this.jira.matchUnsolvedIssues(issueKeys, ['Backend - Ink']);
      console.log('keys=========', keys);
    } catch (e) {
      console.log(e);
    }
  }

  @Command({
    command: 'test'
  })
  // @Timeout(5000)
  @logExecTime()
  private async test() {
    console.log('test========');
    await this.checkRelease();
    // const result = await this.aws.getJiraToken();
    // console.log(result);
   // console.log(token);
  }
}

function logExecTime(logFunc=console.log) {
  return (target, methodName: string, desc: PropertyDescriptor) => {
    const method = desc.value;
    desc.value = async function(...args) {
      const now = new Date().getTime();
      await method.apply(this, args)
      logFunc(`Method "${methodName}" cost ${new Date().getTime() - now} ms`);
    }
  }
}

