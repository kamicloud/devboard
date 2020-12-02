import { Endpoints } from "@octokit/types";

export type ReposListBranchesResponseData = Endpoints["GET /repos/{owner}/{repo}/branches"]["response"];

interface Wrapper<T> {
  list: T[],
  data: {[index:string]: T},
}

export declare namespace Pages {
  interface KanbanPageProps {
    // query: { name?: string };
    common: {
      endpoint: string,
      projectId: string,
    },

    branches: Wrapper<ReposListBranchesResponseData>,
    groups: Jira.Group[],
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

  interface PageLayoutProps {

  }
}
