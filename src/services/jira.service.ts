import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class JiraService {

  constructor(private configService: ConfigService) { }

  async search() {
    const { endpoint, username, password } = this.configService.get<any>('jira');
    const { data } = await axios.get(`${endpoint}/search`, {
      auth: {
        username: username,
        password: password,
      },
      params: {
        jql: 'project = "12512" order by updated DESC',
      }
    });
    return data;
  }

  async changelog(issue) {
    const { endpoint, username, password } = this.configService.get<any>('jira');

    const { data } = await axios.get(`${endpoint}/issue/${issue}/changelog`, {
      auth: {
        username: username,
        password: password,
      },
    });
    return data;
  }

  async comments(issue) {
    const { endpoint, username, password } = this.configService.get<any>('jira');

    const { data } = await axios.get(`${endpoint}/issue/${issue}/comment`, {
      auth: {
        username: username,
        password: password,
      },
    });
    return data;
  }
}
