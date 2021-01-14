import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Jira } from 'src/type';

const JIRA_COMMENT_CONTENT_TYPE_DOC = 'doc';
const JIRA_COMMENT_CONTENT_TYPE_PARAGRAPH = 'paragraph';
const JIRA_COMMENT_CONTENT_TYPE_TEXT = 'text';
const JIRA_COMMENT_CONTENT_TYPE_MENTION = 'mention';
const JIRA_COMMENT_CONTENT_TYPE_INLINE_CARD = 'inlineCard';
const JIRA_COMMENT_CONTENT_TYPE_HARD_BREAK = 'hardBreak';

@Injectable()
export class JiraService {

  protected prefixV3 = '/rest/api/3';
  protected prefixWiki = '/wiki/rest/api';

  constructor(private configService: ConfigService) { }

  async search(assignee?: string, startAt = 0, projectId?: string) {
    const { endpoint, username, password } = this.configService.get<any>('jira');

    const wheres = [];

    if (projectId) {
      wheres.push(`project = "${projectId}"`);
    }

    if (assignee) {
      wheres.push(`assignee = "${assignee}"`);
    }

    // wheres.push('status != "closed"')

    const res = await axios.get(`${endpoint}${this.prefixV3}/search`, {
      auth: {
        username: username,
        password: password,
      },
      params: {
        jql: `${wheres.join(' and ')} order by updated DESC`,
        startAt,
      }
    }).catch(e => {
      console.log(e.message)
    });

    if (!res) {
      return {
        issues:[],
      };
    }

    const { data }: { data: { issues: Jira.Issue[] } } = res;

    return data;
  }

  async groups() {
    const { endpoint, username, password } = this.configService.get<any>('jira');

    const res = await axios.get(`${endpoint}${this.prefixWiki}/group`, {
      auth: {
        username: username,
        password: password,
      },
    }).catch(e => {
      console.log(e.message)
    });

    if (!res) {
      return [];
    }

    const { data }: { data: { results: Jira.Group[] } } = res;

    return data.results;
  }

  async groupMembers(id: string): Promise<Jira.Member[]> {
    const { endpoint, username, password } = this.configService.get<any>('jira');

    const res = await axios.get(`${endpoint}${this.prefixWiki}/group/${id}/membersByGroupId`, {
      auth: {
        username: username,
        password: password,
      },
    });

    const { data }: { data: { results: Jira.Member[] } } = res;

    return data.results;
  }

  async changelog(issue) {
    const { endpoint, username, password } = this.configService.get<any>('jira');

    const { data }: { data: { values: Jira.Changelog[] } } = await axios.get(`${endpoint}${this.prefixV3}/issue/${issue}/changelog`, {
      auth: {
        username: username,
        password: password,
      },
    });
    return data;
  }

  async comments(issue) {
    const { endpoint, username, password } = this.configService.get<any>('jira');

    const { data }: { data: { comments: Jira.IssueComment[] } } = await axios.get(`${endpoint}${this.prefixV3}/issue/${issue}/comment`, {
      auth: {
        username: username,
        password: password,
      },
    });
    return data;
  }

  parseJiraDoc(element: Jira.Doc): string {
    return element.content.map(content => {
      if (content.type === JIRA_COMMENT_CONTENT_TYPE_PARAGRAPH) {
        return this.parseJiraDocParagraph(content);
      }

      console.log('unexpected paragraph node', content)
      return '';
    }).join("\n");
  }

  parseJiraDocParagraph(paragraph: Jira.DocParagraph): string {
    return paragraph.content.map(text => {
      if (text.type === JIRA_COMMENT_CONTENT_TYPE_TEXT) {
        return text.text;
      }
      if (text.type === JIRA_COMMENT_CONTENT_TYPE_MENTION) {
        return `@${text.attrs.text}`;
      }
      if (text.type === JIRA_COMMENT_CONTENT_TYPE_HARD_BREAK) {
        return "\n";
      }

      console.log('unexpected text node', text);
      return '';
    }).join('');
  }
}
