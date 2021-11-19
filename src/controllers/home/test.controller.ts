import { Controller, Get, Query, Render, Param, Req } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { NodegitService } from '../../services/nodegit.service';
import { GithubService } from '../../services/github.service';
import { Octokit } from '@octokit/rest';

@Controller('test')
export class TestController {
  constructor(
    private readonly appService: AppService,
    private readonly githubService: GithubService,
    private readonly nodegitService: NodegitService
  ) {}

  @Render('pages/test')
  @Get()
  public async index(@Query('repository') repository: string) {
    return repository;
  }

  @Get('/git')
  public async testGit() {
    // const result = await this.githubService.listTags('sincerely')
    // const TOKEN = process.env.GITHUB_TOKEN;
    // const octokit = new Octokit({auth: TOKEN});
    //
    // const {data} = await octokit.request('/user');
    //
    // const tags = await octokit.paginate(octokit.repos.listTags, {
    //   owner: 'm7nevil',
    //   repo: 'test-jira',
    //   per_page: 100,
    // });

    // const repo = await this.nodegitService.cloneRepository('sincerely', true);

    // await this.nodegitService.fetchAndPull('sincerely');

    // let tags = await this.nodegitService.listTags('sincerely', 'snapi-admin*');
    // tags = tags.reverse();
    //
    // const toTag = tags[0];
    // const fromTag = tags[1];

    const tags = await this.nodegitService.getRecentTags('sincerely', 'snapi-v*', 2);
    const arr = tags.split('\n')
    console.log(arr);

    // let logs = await this.nodegitService.logsBetweenTags('sincerely', fromTag, toTag);
    // console.log(logs);



    return 'success';
  }

  private getIssueIds(logs) {
    const reg = /(sa|#)(\d+)]/gi;
    const matches = [...logs.matchAll(reg)]
    return matches.map(match  => match[2]);
  }
}
