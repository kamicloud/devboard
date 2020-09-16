import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import notifier from 'node-notifier';
import { JenkinsService } from './jenkins.service';
import { JiraService } from './jira.service';

const STATE_RUNNING = 'RUNNING';
const STATE_FINISHED = 'FINISHED';
const STATE_QUEUED = 'QUEUED';

declare interface JenkinsRun {
  id: string,
  pipeline: string,
  state: string,
  changeSet: {}[],
  result: string,
  causes: {
    shortDescription: string,
  }[]
}

declare interface JiraIssue {
  id: string,
  key: string,
  fields: {
    summary: string,
    updated: string,
  }
}

declare interface JiraChangelog {
  author: JiraAuthorProfile,
  created: string,
  items: {
    field: string,
    fieldtype: string,
    fromString?: string,
    toString?: string,
  }[],
}

declare interface JiraAuthorProfile {
  displayName: string,
  emailAddress: string,
}

declare interface JiraIssueComment {
  id: string,
  author: JiraAuthorProfile,
  body: {
    version: number,
    type: string,
  },
  created: string,
  updated: string,
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private temp = {};
  private notifyEnabled = {};
  private jiraActivitiesMap = {};

  private jiraLastRun: Date = new Date();

  constructor(
    private configService: ConfigService,
    private jenkinsService: JenkinsService,
    private jiraService: JiraService
  ) {
    this.jiraLastRun = new Date();
  }

  @Cron('*/10 * * * * *')
  async loadJenkinsActivities() {
    const { enabled, username, password, host, jobs, dingdingToken } = this.configService.get<any>('jenkins');

    if (!enabled) {
      return;
    }

    await jobs.split(',').forEach(async job => {
      const { data }: { data: JenkinsRun[] } = await axios.get(`${host}/blue/rest/organizations/jenkins/pipelines/${job}/runs/`, {
        auth: {
          username,
          password,
        }
      });

      let contentArr: string[] = data.reverse().filter(element => {
        const pipeline = decodeURIComponent(element.pipeline)
        const hash = `${pipeline}_${element.id}`;
        const state = element.state;

        const filter = !this.temp[hash] || this.temp[hash].state !== state;

        if (filter) {
          this.temp[hash] = element;

        }
        return filter;
      }).filter(element => {
        const changeSet = element.changeSet;
        if (this.notifyEnabled[job] && changeSet && changeSet.length) {
          notifier.notify(JSON.stringify(element));
          return false;
        }

        return true;
      }).filter(element => {
        const { causes } = element;

        for (let i = 0; i < causes.length; i++) {
          const cause = causes[i];

          if (cause.shortDescription.indexOf('Push event to branch') !== -1) {
            return false;
          }
        }

        return true;
      }).map(element => {
        const pipeline = decodeURIComponent(element.pipeline)
        const { state, result } = element;

        let content = '';

        content += `${pipeline} \t${this.jenkinsService.mapState(state)}\t${this.jenkinsService.mapResult(result)}`;

        return content;
      });
      if (dingdingToken && this.notifyEnabled[job] && contentArr.length) {
        const content = `${job} releases:\n${contentArr.join("\n")}`;
        await axios.post(`https://oapi.dingtalk.com/robot/send?access_token=${dingdingToken}`, {
          msgtype: 'text',
          text: {
            content,
          }
        });
      }
      this.notifyEnabled[job] = true;
    });
  }

  @Cron('*/10 * * * * *')
  async loadJiraActivities() {
    const { issues }: { issues: JiraIssue[] } = await this.jiraService.search();

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

    for (let i = 0; i < filteredIssues.length; i++) {
      const issue = filteredIssues[i];
      const { fields } = issue;

      const updated = new Date(fields.updated);

      const { values }: { values: JiraChangelog[] } = await this.jiraService.changelog(issue.key);
      const { comments }: { comments: JiraIssueComment[] } = await this.jiraService.comments(issue.key);
      console.log(issue.key, fields.summary, updated);

      let finalContent = `Title: [${issue.key}] ${fields.summary}\n`;

      finalContent += values.filter(value => {
        const created = new Date(value.created);

        if (jiraLastRun.getTime() >= created.getTime() || this.jiraLastRun.getTime() < updated.getTime()) {
          return false;
        }

        return true;
      }).map(value => {
        const created = new Date(value.created);
        console.log(value, jiraLastRun, created)
        const content = value.items.map(item => {
          const { field } = item;

          return `${field}: ${item.fromString} => ${item.toString}`;
        }).join("\n");
        return `Author: ${value.author.displayName}\n${content}\n`;
      }).join("\n");

      comments.filter(comment => {
        const updated = new Date(comment.updated);
        if (jiraLastRun.getTime() >= updated.getTime() || this.jiraLastRun.getTime() < updated.getTime()) {
          return false;
        }
        return true;
      });

      const { dingtalkToken2 } = this.configService.get<any>('jenkins');
      const { data } = await axios.post(`https://oapi.dingtalk.com/robot/send?access_token=${dingtalkToken2}`, {
        msgtype: 'text',
        text: {
          content: finalContent,
        }
      });
      console.log(finalContent, data);
    }
  }
}
