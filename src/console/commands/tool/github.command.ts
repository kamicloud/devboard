import { Console, Command, createSpinner, ConsoleService } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JenkinsService } from 'src/services/jenkins.service';
import { JiraService } from 'src/services/jira.service';
import { GithubService } from 'src/services/github.service';
import moment from 'moment';
import { timeStamp } from 'console';
import _ from 'lodash';

@Console({
  name: 'github',
})
@Injectable()
export class GithubCommand {
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
    command: 'delete-old-releases',
    description: 'Test command for debug.'
  })
  async handle(): Promise<void> {
    const releases = (await this.githubService.releases('sincerely')).reverse();

    console.log(releases[0]);

    for (const release of releases) {
      if (moment(new Date()).diff(moment(new Date(release.created_at)), 'days') > 60) {

        // console.log(release);
        // const res = await this.githubService.deleteTag('sincerely', release.tag_name);
        // snapi-gifting-v1.11.90
        // console.log(release.tag_name, (await this.githubService.getRef('sincerely', `tags/${release.tag_name}`).catch(e => null)));

        console.log(release.tag_name)
        await this.githubService.deleteTag('sincerely', release.tag_name).catch(e => {
          console.log(e)
        });

        await this.githubService.deleteRelease('sincerely', release.id).catch(e => {
          console.log(e);
        });
      //   return;
      }
    }

    const releasesByTagName = _.keyBy(releases, 'tag_name');

    const tags = (await this.githubService.listTags('sincerely')).reverse();

    for (const tag of tags) {
      if (!releasesByTagName[tag.name]) {
        console.log(tag.name)
        await this.githubService.deleteTag('sincerely', tag.name).catch(e => {
          console.log(e)
        });
      }
    }


    // console.log(releases.length, releases[0])
    return;
  }
}
