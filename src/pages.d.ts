import { Endpoints } from "@octokit/types";

export type ReposListBranchesResponseData = Endpoints["GET /repos/{owner}/{repo}/branches"]["response"]['data'];
export type CommitsListResponseData = Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]['data'];

interface Wrapper<T> {
  list: T[],
  data: {[index:string]: T},
}

export declare namespace Pages {
  interface DeployPageProps {
    branches: ReposListBranchesResponseData,
    commits: CommitsListResponseData,
    owner: string,
    repository: string,
    branch: string,
    repositories: string[],
    sites: {
      stage: string[],
      pre: string[],
      live: string[],
    },
    gitDeployHistories: any[],
  }

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
