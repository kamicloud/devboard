import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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

    // sometimes data from jenkins api cutting off and parsed as string
    if (!res || typeof res.data === 'string') {
      return { data: [] };
    }

    let { data } = res;

    return { data };
  }

  public async getBranch(job, branch): Promise<Jenkins.Branch | null> {
    const { username, password, host } = this.configService.get<any>('jenkins');
    const res = await axios.get(`${host}/blue/rest/organizations/jenkins/pipelines/${job}/branches/${branch}/`, {
      auth: {
        username,
        password,
      }
    }).catch((error: Error) => {
      console.log(error.message, error.stack, error.name)
    });

    if (!res || !res.data) {
      return null;
    }

    return res.data;
  }

  public mapResult(result: string) {
    switch (result) {
      case 'UNKNOWN':
        return 'in progress';
      case 'SUCCESS':
        return 'success';
      case 'FAILURE':
        return 'failed';
      default:
        return result;
    }
  }

  public mapState(state: string) {
    switch (state) {
      case 'FINISHED':
        return 'finished';
      case 'RUNNING':
        return 'running';
      case 'QUEUED':
        return 'in queue'
      default:
        return state;
    }
  }
}

export declare namespace Jenkins {
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

  interface Branch {
    latestRun?: Jenkins.Run,
  }
}
