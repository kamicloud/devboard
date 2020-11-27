import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import jenkinsapi from 'jenkins-api';
import { Jenkins } from 'src/type';

@Injectable()
export class JenkinsService {
  constructor(
    private configService: ConfigService
  ) {
  }

  public async getRuns(job: string): Promise<{ data: Jenkins.Run[] }> {
    const { username, password, host } = this.configService.get<any>('jenkins');
    let res = await axios.get(`${host}/blue/rest/organizations/jenkins/pipelines/${job}/runs/`, {
      auth: {
        username,
        password,
      }
    }).catch((error: Error) => {
      console.log(error.message, error.stack, error.name)
    });

    if (!res) {
      return { data: [] };
    }

    let { data } = res;

    if (typeof data === 'string') {
        data = JSON.parse(data)
    }

    return { data };
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
