import { Console, Command, createSpinner, ConsoleService } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JenkinsService } from 'src/services/jenkins.service';
import { JiraService } from 'src/services/jira.service';
import { GithubService } from 'src/services/github.service';

@Console({
  name: 'tool',
})
@Injectable()
export class JiraCommand {
  constructor(
    private configService: ConfigService,
    private jenkinsService: JenkinsService,
    private jiraService: JiraService,
    private githubService: GithubService,
    // private connection: Connection,
    // @InjectRepository(GitDeployHistory)
    // private gitDeployHistoryRepository: Repository<GitDeployHistory>,
  ) {
  }

  @Command({
    command: 'jira',
    description: 'Test command for debug.'
  })
  async handle(): Promise<void> {
    const accountId = '5f0836dab545e20015763c7e';
    for (let i = 0; i < 100; i++) {
      const issues = (await this.jiraService.search('', 50 * i, '12512')).issues;

      for (const issue of issues) {
        const comments = await this.jiraService.comments(issue.id);
        const changelogs = await this.jiraService.changelog(issue.id)

        let res = comments.comments.filter(comment => {
          return comment.author.accountId === accountId
        })

        let res2 = changelogs.values.filter(changelog => {
          return changelog.author.accountId === accountId
        })

        if ((issue.fields.assignee && issue.fields.assignee.accountId === accountId) || res.length || res2.length) {
          console.log(`${issue.key}\t${issue.fields.status.name}\t${issue.fields.summary}`)
        }
      }

      // console.log((await this.jiraService.search('', 50 * i)).issues.map(issue => {
      //   if (!issue.fields.assignee) {
      //     return null;
      //   }
      //   return issue.fields.assignee.displayName + '   ' + issue.fields.assignee.accountId
      // }));
    }
  }
}
