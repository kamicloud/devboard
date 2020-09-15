import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class JiraService {

  constructor(private configService: ConfigService) { }

  async search() {
    const { endpoint, username, password } = this.configService.get<any>('jira');
    await axios.get(`${endpoint}/search`, {
      auth: {
        username: username,
        password: password,
      },
      params: {
        currentProjectId: 12512
      }
    });
    return 'Hello World!';
  }
}
