import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import notifier from 'node-notifier';

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

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private temp = {};
  private notifyEnabled = {};

  constructor(private configService: ConfigService) { }

  @Cron('*/10 * * * * *')
  async handleCron() {
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

        content += `${pipeline} \t${this.mapState(state)}\t${this.mapResult(result)}`;

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

  public mapResult(result: string) {
    switch (result) {
      case 'UNKNOWN':
        return '未完成';
      case 'SUCCESS':
        return '成功';
      case 'FAILURE':
        return '失败';
      default:
        return result;
    }
  }

  public mapState(state: string) {
    switch (state) {
      case 'FINISHED':
        return '部署结束';
      case 'RUNNING':
        return '部署中';
      case 'QUEUED':
        return '队列等待'
      default:
        return state;
    }
  }
}
