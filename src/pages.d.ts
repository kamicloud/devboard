export declare namespace Pages {
  interface KanbanPageProps {
    // query: { name?: string };
    issues: {
      issues: Jira.Issue[],
    },
  }

  interface ReleasesPageProps {
    query: {
      name?: string,
      releases: {
        sha: string,
        date: string,
        message: string,
      }[]
    };
  }

  interface CommitsPageProps {
    name?: string,
    commits: {
      sha: string,
      date: string,
      message: string,
    }[]
    branch: string,
  }
}
