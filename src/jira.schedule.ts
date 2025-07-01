import {Command, Console} from 'nestjs-console';
import {Injectable} from '@nestjs/common';
import {Logger} from 'nestjs-pino';
import {ConfigService} from '@nestjs/config';
import ConfigUtil from './services/config.util';
import {isEmpty} from '@nestjs/common/utils/shared.utils';
import {trimEnd} from 'lodash';
import {NodegitService} from './services/nodegit.service';
import {JiraApiService} from './services/jira-api.service';
import {BackendComponents} from './services/jira-const';
import {Cron, CronExpression} from '@nestjs/schedule';
import axios from "axios";
import {JenkinsService} from "./services/jenkins.service";
import {DatabaseService} from "./services/database.service";

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

  private jenkinsJobs = {};
  private jenkinsBooted = false;
  private notifyEnabled = {};

  constructor(
    private readonly logger: Logger,
    private readonly configUtil: ConfigUtil,
    private readonly git: NodegitService,
    private readonly jira: JiraApiService,
    private configService: ConfigService,
    private jenkinsService: JenkinsService,
    private databaseService: DatabaseService,
  ) {}

  @Command({
    command: 'check-release',
    description: 'Check unsolved issues of released version'
  })
  @Cron(CronExpression.EVERY_5_MINUTES)
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
    if (isEmpty(issueKeys)) {
      return;
    }

    const keys = await this.filterByComponent(site, issueKeys);
    this.logger.log(`${site} is going to resolve tickets======[${keys}]`)
    if (isEmpty(keys)) {
      return;
    }

    for (const key of keys) {
      const ok = await this.jira.setIssueResolved(key);
      this.logger.log(`Resolving [${key}] ${ok ? '==succeeded==' : '==failed=='}`)
    }
  }

  private async filterByComponent(site, issueKeys): Promise<any[]> {
    const coms = JiraSchedule.PROJECT_COMPONENT[site];
    if (isEmpty(coms)) {
      return [];
    }
    const comNames = coms.map(com => com.name)
    return await this.jira.matchUnsolvedIssues(issueKeys, comNames)
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
    command: 'jenkins',
    description: 'Command for jenkins'
  })
  @Cron('*/10 * * * * *')
  async loadJenkinsActivities() {
    const { enabled, jobs, dingdingToken, slackToken } = this.configService.get<any>('jenkins');

    if (!enabled) {
      return;
    }

    this.logger.log('jenkins started');

    for (const job of jobs.split(',')) {
      const { data } = await this.jenkinsService.getRuns(job);

      const dataFiltered = data.reverse().filter(element => {
        // filter state
        const pipeline = decodeURIComponent(element.pipeline)
        const hash = `${pipeline}_${element.id}`;
        const state = element.state;

        return !this.jenkinsJobs[hash] || this.jenkinsJobs[hash].state !== state;
      }).filter(element => {
        // filter changeSet
        const changeSet = element.changeSet;

        return !(this.notifyEnabled[job] && changeSet && changeSet.length);
      }).filter(element => {
        // filter pipeline
        const pipeline = decodeURIComponent(element.pipeline)

        return pipeline.startsWith('snapi-v') ||
          pipeline.startsWith('snapi-eu-v') ||
          pipeline.startsWith('snapi-gifting-v') ||
          pipeline.startsWith('snapi-pca-v') ||
          pipeline.startsWith('snapi-admin-v') ||
          pipeline.startsWith('preview-v') ||
          pipeline.startsWith('preview-eu-v') ||
          pipeline.startsWith('preview-gifting-v') ||
          pipeline.startsWith('worker-v') ||
          pipeline.startsWith('worker-eu-v') ||
          pipeline.startsWith('runner-v') ||
          pipeline.startsWith('runner-eu-v') ||
          pipeline.startsWith('webhook-v') ||
          pipeline.startsWith('webhook-eu-v');
      })

      const contentArr: string[] = [];

      for (const element of dataFiltered) {
        const pipeline = decodeURIComponent(element.pipeline)
        const hash = `${pipeline}_${element.id}`;
        const { state, result } = element;

        this.jenkinsJobs[hash] = element;

        let content = '';

        const gitDeployHistory = await this.databaseService.getReleaseBranch('sincerely', pipeline);
        const branch = gitDeployHistory ? ` from ${gitDeployHistory.branch}` : '';

        content += `${pipeline}${branch}\t${this.jenkinsService.mapState(state)}\t${this.jenkinsService.mapResult(result)}`;

        contentArr.push(content);
      }

      const content = contentArr.length ? `${job} releases:\n${contentArr.join("\n")}` : null;

      if (!content) {
        return;
      }

      console.log(content);

      if (this.jenkinsBooted && this.notifyEnabled[job]) {
        if (dingdingToken) {
          await axios.post(`https://oapi.dingtalk.com/robot/send?access_token=${dingdingToken}`, {
            msgtype: 'text',
            text: {
              content,
            }
          });
        }

        if (slackToken) {
          await axios.post(`https://hooks.slack.com/services/${slackToken}`, {
            channel: '#sa_deployments',
            username: 'webhookbot',
            text: content,
            // icon_emoji: ':ghost:',
          })
        }
      }

      this.jenkinsBooted = true;
      this.notifyEnabled[job] = true;
    }
  }

  @Command({
    command: 'update-deployment-status',
    description: 'Command for jenkins'
  })
  @Cron('*/10 * * * * *')
  async updateDeploymentStatus() {
    this.logger.log('update-deployment-status');
    const handler = async (project: string, jenkinsProjectName: string) => {
      const deployHistories = await this.databaseService.getReleaseDeployingHistories(project);

      for (const deployHistory of deployHistories) {
        const data = await this.jenkinsService.getBranch(jenkinsProjectName, deployHistory.release);

        if (data && data.latestRun) {
          if (data.latestRun.result === 'SUCCESS' || data.latestRun.result === 'FAILURE' || data.latestRun.result === 'ABORTED') {
            deployHistory.deploymentStatus = 'deployed';

            await this.databaseService.updateDeployHistoryStatus(
              deployHistory,
              data.latestRun.result === 'SUCCESS' ? 'deployed' : 'blocked'
            )
          }
        }
      }
    }

    await handler('sincerely', 'sincerely-snapi')
    await handler('freeprints-web', 'freeprints-web')
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

