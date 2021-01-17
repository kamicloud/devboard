import { Github, Jira } from './type';

export declare namespace Pages {
  export interface DeployPageProps {
    branches: Github.ReposListBranchesResponseData,
    commits: Github.CommitsListResponseData,
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
    gitHotfixedCommits: any[],
  }

  interface KanbanPageProps {
    // query: { name?: string };
    common: {
      endpoint: string,
      projectId: string,
    },

    branches: Github.ReposListBranchesResponseData,
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
