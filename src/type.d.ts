
export declare namespace Jira {
  interface Pagination {
    startAt: number,
    maxResults: number,
    total: number,
  }

  interface Issue {
    id: string,
    key: string,
    fields: {
      summary: string,
      created: string,
      updated: string,
      assignee: Jira.AuthorProfile,
      status: Jira.IssueStatus,
    },
  }

  interface IssueStatus {
    description: string,
    iconUrl: string,
    name: string,
    id: string,
    statusCategory: {
      id: number,
      key: string,
      colorName: string,
      name: string,
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
    self: string,
    displayName: string,
    emailAddress: string,
    accountId: string,
    active: boolean,
    timeZone: string,
    accountType: string,
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

  interface Group {
    type: string,
    name: string,
    id: string,
  }

  interface Member {
    type: string,
    accountId: string,
    accountType: string,
    email: string,
    publicName: string,
    displayName: string,
    isExternalCollaborator: boolean,
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
}
