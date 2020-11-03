import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const JIRA_COMMENT_CONTENT_TYPE_DOC = 'doc';
const JIRA_COMMENT_CONTENT_TYPE_PARAGRAPH = 'paragraph';
const JIRA_COMMENT_CONTENT_TYPE_TEXT = 'text';
const JIRA_COMMENT_CONTENT_TYPE_MENTION = 'mention';
const JIRA_COMMENT_CONTENT_TYPE_INLINE_CARD = 'inlineCard';
const JIRA_COMMENT_CONTENT_TYPE_HARD_BREAK = 'hardBreak';

@Injectable()
export class JiraService {

  constructor(private configService: ConfigService) { }

  async search() {
    const { endpoint, username, password, projectId } = this.configService.get<any>('jira');
    const { data }: { data: { issues: Jira.Issue[] } } = await axios.get(`${endpoint}/search`, {
      auth: {
        username: username,
        password: password,
      },
      params: {
        jql: `project = "${projectId}" order by updated DESC`,
      }
    });
    return data;
  }

  async changelog(issue) {
    const { endpoint, username, password } = this.configService.get<any>('jira');

    const { data }: { data: { values: Jira.Changelog[] } } = await axios.get(`${endpoint}/issue/${issue}/changelog`, {
      auth: {
        username: username,
        password: password,
      },
    });
    return data;
  }

  async comments(issue) {
    const { endpoint, username, password } = this.configService.get<any>('jira');

    const { data }: { data: { comments: Jira.IssueComment[] } } = await axios.get(`${endpoint}/issue/${issue}/comment`, {
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

declare namespace Jira {
  interface Issue {
    id: string,
    key: string,
    fields: {
      summary: string,
      created: string,
      updated: string,
    }
  }

  interface Changelog {
    author: Jira.AuthorProfile,
    created: string,
    items: {
      field: string,
      fieldtype: string,
      fromString?: string,
      toString?: string,
    }[],
  }

  interface AuthorProfile {
    displayName: string,
    emailAddress: string,
  }

  interface IssueComment {
    id: string,
    author: Jira.AuthorProfile,
    body: Jira.Doc,
    created: string,
    updated: string,
  }

  interface Doc {
    version: number,
    type: string,
    content: Array<Jira.DocParagraph | Jira.DocMediaSingle>,
  }

  interface DocParagraph {
    type: string,
    content: Jira.DocText[],
  }

  interface DocMediaSingle {
    type: string,
    attrs: {
      width: number,
      layout: string,
    },
    content: any, //TODO:
  }

  interface DocText {
    type: string,
    text: string | undefined,
    attrs: {
      id: string | undefined,
      text: string | undefined,
      url: string | undefined,
    } | undefined,
    marks: {
      type: string,
      attrs: {
        href: string,
      }
    }[] | undefined
  }
}
