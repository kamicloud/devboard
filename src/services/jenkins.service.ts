import { Injectable } from '@nestjs/common';
import jenkinsapi from 'jenkins-api';

@Injectable()
export class JenkinsService {
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
