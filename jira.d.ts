declare namespace Jira {
  declare interface JiraIssue {
    id: string,
    key: string,
    fields: {
      summary: string,
      updated: string,
    }
  }

  declare interface JiraChangelog {
    author: JiraAuthorProfile,
    created: string,
    items: {
      field: string,
      fieldtype: string,
      fromString?: string,
      toString?: string,
    }[],
  }

  declare interface JiraAuthorProfile {
    displayName: string,
    emailAddress: string,
  }

  declare interface JiraIssueComment {
    id: string,
    author: JiraAuthorProfile,
    body: {
      version: number,
      type: string,
    },
    created: string,
    updated: string,
  }
}
