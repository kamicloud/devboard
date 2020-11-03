import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import jenkinsapi from 'jenkins-api';

@Injectable()
export class JenkinsService {
  constructor(
    private configService: ConfigService
  ) {
  }

  public async getRuns(job: string) {
    const { username, password, host } = this.configService.get<any>('jenkins');
    const { data }: { data: Jenkins.Run[] } = await axios.get(`${host}/blue/rest/organizations/jenkins/pipelines/${job}/runs/`, {
      auth: {
        username,
        password,
      }
    });

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

declare namespace Jenkins {
  interface Run {
    id: string,
    pipeline: string,
    state: string,
    changeSet: {}[],
    result: string,
    causes: {
      shortDescription: string,
    }[]
  }
}
