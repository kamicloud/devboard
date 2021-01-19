import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Logger } from "nestjs-pino";
import _ from 'lodash';
import { Console, Command, createSpinner, ConsoleService } from 'nestjs-console';
import { ConfigService } from '@nestjs/config';
import notifier from 'node-notifier';
import { JenkinsService } from '../../services/jenkins.service';
import { JiraService } from '../../services/jira.service';
import axios from 'axios';
import { Brackets, Repository } from 'typeorm';
import { GitDeployHistory } from '../../entities/GitDeployHistory.entity';
import { GitHotfixedCommit } from '../../entities/GitHotfixedCommit.entity';

@Console({
  name: 'tasks',
  description: 'tasks schedule',
})
@Injectable()
export class TasksSchedule {
  private jenkinsJobs = {};
  private jenkinsBooted = false;
  private notifyEnabled = {};
  private jiraActivitiesMap = {};

  private jiraLastRun: Date = new Date();

  constructor(
    private readonly logger: Logger,
    private configService: ConfigService,
    private jenkinsService: JenkinsService,
    private jiraService: JiraService,
    @Inject('GIT_DEPLOY_HISTORY_REPOSITORY')
    private gitDeployHistoryRepository: Repository<GitDeployHistory>,
    @Inject('GIT_HOTFIXED_COMMIT_REPOSITORY')
    private gitHotfixedCommitRepository: Repository<GitHotfixedCommit>,
  ) {
    this.jiraLastRun = new Date();
  }

  @Command({
    command: 'jenkins',
    description: 'Command for jenkins'
  })
  @Cron('*/10 * * * * *')
  async loadJenkinsActivities() {
    this.logger.log('jenkins started');
    const { enabled, jobs, dingdingToken } = this.configService.get<any>('jenkins');

    if (!enabled) {
      return;
    }

    for (const job of jobs.split(',')) {
      const { data } = await this.jenkinsService.getRuns(job);

      let contentArr: string[] = data.reverse().filter(element => {
        const pipeline = decodeURIComponent(element.pipeline)
        const hash = `${pipeline}_${element.id}`;
        const state = element.state;

        const filter = !this.jenkinsJobs[hash] || this.jenkinsJobs[hash].state !== state;

        return filter;
      }).filter(element => {
        const changeSet = element.changeSet;
        if (this.notifyEnabled[job] && changeSet && changeSet.length) {
          // notifier.notify(JSON.stringify(element));
          return false;
        }

        return true;
      }).filter(element => {
        const { causes } = element;

        for (let i = 0; i < causes.length; i++) {
          const cause = causes[i];

          if (
            cause.shortDescription.indexOf('Push event to branch') !== -1 ||
            cause.shortDescription.indexOf('Pull request') !== -1 ||
            cause.shortDescription.indexOf('Branch indexing') !== -1
          ) {
            return false;
          }
        }

        return true;
      }).map(element => {
        const pipeline = decodeURIComponent(element.pipeline)
        const hash = `${pipeline}_${element.id}`;
        const { state, result } = element;

        this.jenkinsJobs[hash] = element;

        let content = '';

        content += `${pipeline} \t${this.jenkinsService.mapState(state)}\t${this.jenkinsService.mapResult(result)}`;

        return content;
      });

      const content = contentArr.length ? `${job} releases:\n${contentArr.join("\n")}` : null;

      if (!content) {
        return;
      }

      console.log(content);

      if (this.jenkinsBooted && dingdingToken && this.notifyEnabled[job]) {
        await axios.post(`https://oapi.dingtalk.com/robot/send?access_token=${dingdingToken}`, {
          msgtype: 'text',
          text: {
            content,
          }
        });
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
    const project = 'sincerely';
    const jenkinsProjectName = 'sincerely-snapi';

    const deployHistories = await this.gitDeployHistoryRepository
      .createQueryBuilder()
      .where(new Brackets(qb => {
        qb.andWhere('repository=:repostiory', { repostiory: project })
        qb.andWhere('deployment_status=:deploymentStatus', { deploymentStatus: 'deploying' })
        qb.andWhere('`release`<>:release', { release: '' })
      }))
      .getMany();

    for (const deployHistory of deployHistories) {
      const data = await this.jenkinsService.getBranch(jenkinsProjectName, deployHistory.release);

      if (data && data.latestRun) {
        if (data.latestRun.result === 'SUCCESS' || data.latestRun.result === 'FAILURE') {
          deployHistory.deploymentStatus = 'deployed';
          await this.gitDeployHistoryRepository
            .createQueryBuilder()
            .update()
            .whereEntity(deployHistory)
            .set({
              deploymentStatus: data.latestRun.result === 'FAILURE' ? 'blocked' : 'deployed'
            })
            .execute()
        }
      }
    }
  }

  @Command({
    command: 'jira',
    description: 'Command for jenkins'
  })
  @Cron('*/10 * * * * *')
  async loadJiraActivities() {
    this.logger.log('jira started');
    const { issues } = await this.jiraService.search();

    const jiraLastRun = this.jiraLastRun;
    this.jiraLastRun = new Date();

    const filteredIssues = issues.filter(issue => {
      const { fields } = issue;

      const updated = new Date(fields.updated);

      if (jiraLastRun.getTime() >= updated.getTime() || this.jiraLastRun.getTime() < updated.getTime()) {
        return false;
      }

      return true;
    });

    for (const issue of filteredIssues) {
      const { fields } = issue;

      const created = new Date(fields.created);
      const updated = new Date(fields.updated);

      const { values } = await this.jiraService.changelog(issue.key);
      const { comments } = await this.jiraService.comments(issue.key);
      // console.log(issue.key, fields.summary, updated);

      const isCreated = jiraLastRun.getTime() < created.getTime();

      let finalContent = (isCreated ? '[NEW] ' : '') + `[${issue.key}] ${fields.summary}\n`;

      finalContent += values.filter(value => {
        const created = new Date(value.created);

        if (jiraLastRun.getTime() >= created.getTime() || this.jiraLastRun.getTime() < updated.getTime()) {
          return false;
        }

        return true;
      }).map(value => {
        const created = new Date(value.created);
        // console.log(value, jiraLastRun, created)
        const content = value.items.map(item => {
          const { field } = item;

          return `${field}: ${item.fromString} => ${item.toString}`;
        }).join("\n");
        return `Author: ${value.author.displayName}\n${content}\n`;
      }).join("\n");

      finalContent += comments.filter(comment => {
        const updated = new Date(comment.updated);
        if (jiraLastRun.getTime() >= updated.getTime() || this.jiraLastRun.getTime() < updated.getTime()) {
          return false;
        }
        return true;
      }).map(comment => {

        return `${comment.author.displayName}: ` + this.jiraService.parseJiraDoc(comment.body);
      }).join("\n");

      finalContent += "\n";

      const { dingtalkToken2 } = this.configService.get<any>('jenkins');
      // const { data } = await axios.post(`https://oapi.dingtalk.com/robot/send?access_token=${dingtalkToken2}`, {
      //   msgtype: 'text',
      //   text: {
      //     content: finalContent,
      //   }
      // });
      console.log(finalContent);
    }
  }
}
