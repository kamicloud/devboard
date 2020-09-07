import { Injectable } from '@nestjs/common';
import jenkinsapi from 'jenkins-api';

@Injectable()
export class JenkinsService {
  getHello(): string {
    return 'test';
  }
}
