import { Console, Command, createSpinner, ConsoleService } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JenkinsService } from 'src/services/jenkins.service';
import { JiraService } from 'src/services/jira.service';
import { GithubService } from 'src/services/github.service';
import _ from 'lodash';

@Console({
  command: 'tool',
})
@Injectable()
export class JiraCommand {
  constructor(
    private configService: ConfigService,
    private jenkinsService: JenkinsService,
    private jiraService: JiraService,
    private githubService: GithubService,
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

        let filteredComments = comments.comments.filter(comment => {
          return comment.author.accountId === accountId
        })

        let filterChangelogs = changelogs.values.filter(changelog => {
          return changelog.author.accountId === accountId
        })

        if ((issue.fields.assignee && issue.fields.assignee.accountId === accountId) || filteredComments.length || filterChangelogs.length) {
          let timeList = [];

          if (filteredComments.length) {
            timeList.push(filteredComments[filteredComments.length - 1].created);
          }

          if (filterChangelogs.length) {
            timeList.push(filterChangelogs[filterChangelogs.length - 1].created);
          }

          if (!timeList.length) {
            timeList.push(issue.fields.created)
          }

          timeList = timeList.sort();

          // filterChangelogs
          const eventTime = timeList.length ? timeList[timeList.length - 1] : '';
          console.log(`${eventTime} ${_.padEnd(issue.key, 8)} ${_.padEnd(issue.fields.status.name, 15)} ${issue.fields.summary}`)
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
