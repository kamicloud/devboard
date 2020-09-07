import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private temp = {};

  constructor(private configService: ConfigService) { }

  @Cron('*/20 * * * * *')
  async handleCron() {
    const { enabled, username, password, host, jobs, dingdingToken } = this.configService.get<any>('jenkins');

    if (!enabled) {
      return;
    }

    await jobs.split(',').forEach(async job => {
      const { data } = await axios.get(`${host}/blue/rest/organizations/jenkins/pipelines/${job}/runs/`, {
        auth: {
          username,
          password,
        }
      });

      let contentArr: string[] = data.reverse().map(element => {
        let content = '';
        const pipeline = decodeURIComponent(element.pipeline)
        const hash = `${pipeline}_${element.id}`;
        const state = element.state;
        console.log(pipeline, state);
        if (this.temp[hash] && this.temp[hash].state === state) {
          return null;
        }
        this.temp[hash] = element;
        content += `${pipeline} \t${state}`;
        // if (element.endTime) {
        // content += `, Finished At: ${element.endTime}`;
        // }
        content += "\n";

        return content;
      }).filter(a => a);
      if (contentArr.length) {
        const content = "Releases:\n" + contentArr.join("==================\n");
        await axios.post(`https://oapi.dingtalk.com/robot/send?access_token=${dingdingToken}`, {
          msgtype: 'text',
          text: {
            content,
          }
        });
      }
    });
  }
}
