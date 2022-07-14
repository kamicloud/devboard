package githubapi

import (
	"context"
	"os"

	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
	"gopkg.in/yaml.v3"
)

type Project struct {
	Type        string
	Name        string
	Token       string
	Orgnization string
	Url         string
	FullUrl     string `yaml:"full-url"`
	TestUrl     string `yaml:"test-url"`
	Sites       struct {
		Stage []string
		Pre   []string
		Live  []string
	}
}

type Repository struct {
	DefaultRepository string   `yaml:"default-repository"`
	ProjectList       []string `yaml:"project-list"`
	Projects          map[string]*Project
}

func GetRepositoryConfig(project string) (*Project, error) {
	repo := Repository{}

	data, err := os.ReadFile("repository.yaml")

	if err != nil {
		return nil, err
	}

	err = yaml.Unmarshal(data, &repo)

	return repo.Projects[project], err
}

func Releases(project string, page int, perPage int) ([]*github.RepositoryRelease, error) {
	repo, err := GetRepositoryConfig(project)

	if err != nil {
		return nil, err
	}

	ctx := context.Background()
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: repo.Token},
	)
	tc := oauth2.NewClient(ctx, ts)
	client := github.NewClient(tc)

	releases, _, err := client.Repositories.ListReleases(ctx, repo.Orgnization, repo.Name, &github.ListOptions{
		Page:    page,
		PerPage: perPage,
	})

	return releases, err
}

func DeleteRef(project string, ref string) error {
	repo, err := GetRepositoryConfig(project)

	if err != nil {
		return err
	}
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: repo.Token},
	)
	tc := oauth2.NewClient(ctx, ts)
	client := github.NewClient(tc)

	_, err = client.Git.DeleteRef(ctx, repo.Orgnization, repo.Name, ref)

	return err
}

func DeleteTag(project string, tag string) error {
	return DeleteRef(project, "tags/"+tag)
}

func DeleteRelease(project string, release int64) error {
	repo, err := GetRepositoryConfig(project)

	if err != nil {
		return err
	}
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: repo.Token},
	)
	tc := oauth2.NewClient(ctx, ts)
	client := github.NewClient(tc)

	_, err = client.Repositories.DeleteRelease(ctx, repo.Orgnization, repo.Name, release)

	return err
}

func commits(project string, branch string) {

}

// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Octokit } from '@octokit/rest';
// import ConfigUtil from '../utils/config.util';
// import { Github } from 'src/type';

// @Injectable()
// export class GithubService {
//   constructor(
//     private configService: ConfigService,
//     private configUtil: ConfigUtil,
//   ) {
//   }

//   public async commits(
//     project,
//     branch = 'master',
//     takePage = 3
//   ): Promise<Github.CommitsListResponseData> {
//     const repositoryConfig = this.configUtil.getRepositoryConfig(project);

//     const octokit = new Octokit({
//       auth: repositoryConfig.token,
//     });

//     let res = [];
//     for (let page = 1; page <= takePage; page++) {
//       const { data } = await octokit.repos.listCommits({
//         owner: repositoryConfig.orgnization,
//         repo: repositoryConfig.name,
//         sha: branch,
//         per_page: 100,
//         page,
//       });
//       res = res.concat(data);
//     }

//     return res;
//   }

//   public async branches(project) {
//     const repositoryConfig = this.configUtil.getRepositoryConfig(project);

//     const octokit = new Octokit({
//       auth: repositoryConfig.token,
//     });

//     const branches = await octokit
//       .paginate(octokit.repos.listBranches, {
//         owner: repositoryConfig.orgnization,
//         repo: repositoryConfig.name,
//         per_page: 100,
//       });

//     return branches;
//   }

//   public async createBranch(project, branch, sha) {
//     return await this.createRef(project, `heads/${branch}`, sha);
//   }

//   public async createRef(project, ref, sha) {
//     const repositoryConfig = this.configUtil.getRepositoryConfig(project);

//     const octokit = new Octokit({
//       auth: repositoryConfig.token,
//     });

//     const res = await octokit.git.createRef({
//       owner: repositoryConfig.orgnization,
//       repo: repositoryConfig.name,
//       ref: `refs/${ref}`,
//       sha,
//     });

//     return res;
//   }

//   public async listTags(project) {
//     const repositoryConfig = this.configUtil.getRepositoryConfig(project);

//     const octokit = new Octokit({
//       auth: repositoryConfig.token,
//     });

//     const tags = await octokit
//       .paginate(octokit.repos.listTags, {
//         owner: repositoryConfig.orgnization,
//         repo: repositoryConfig.name,
//         per_page: 100,
//       });

//     return tags;
//   }

//   public async listRefs(project) {
//     // const repositoryConfig = this.configUtil.getRepositoryConfig(project);

//     // const octokit = new Octokit({
//     //   auth: repositoryConfig.token,
//     // });

//     // await octokit.git.re({
//     //   owner: repositoryConfig.orgnization,
//     //   repo: repositoryConfig.name,
//     //   ref: `refs/${ref}`
//     // });

//     // return res;
//   }

//   public async getRef(project, ref) {
//     const repositoryConfig = this.configUtil.getRepositoryConfig(project);

//     const octokit = new Octokit({
//       auth: repositoryConfig.token,
//     });

//     const { data } = await octokit.git.getRef({
//       owner: repositoryConfig.orgnization,
//       repo: repositoryConfig.name,
//       ref: `${ref}`
//     });

//     return data;
//   }

// }
