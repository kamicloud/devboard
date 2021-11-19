import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { NodegitService } from '../../services/nodegit.service';
import ConfigUtil from '../../utils/config.util';
import { awaitExpression } from '@babel/types';
import { JiraApiService } from '../../services/jira-api.service';

@Console({
  name: 'jira',
  description: 'jira schedule',
})
@Injectable()
export class JiraSchedule {
  public static PROJECT_NAME = 'sincerely';
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly configUtil: ConfigUtil,
    private readonly git: NodegitService,
    private readonly jira: JiraApiService,
  ) {
  }

  @Command({
    command: 'check-release',
    description: 'Check issues of released version'
  })
  public async checkRelease() {
    await this.git.fetchAndPull(JiraSchedule.PROJECT_NAME);
    this.logger.log('Fetch done...');

    const repoConfig = this.configUtil.getRepositoryConfig(JiraSchedule.PROJECT_NAME)
    const liveSites = repoConfig.sites.live;
    for (const site of liveSites) {
      this.logger.log('Start to check ' + site);
      const issueIds = await this.getIssueIds(site);

      for (const issueId of issueIds) {
        const trans = await this.jira.getTransitions(issueId);
        this.jira.doTransition(issueId, trans[1]).catch(reason => {
          this.logger.log(reason.toString());
        });
      }
    }
  }

  private async getIssueIds(site) {
    const tagStr = await this.git.getRecentTags(JiraSchedule.PROJECT_NAME, `${site}-v*`, 2);
    this.logger.log('tags===' + tagStr);
    const tags = tagStr.split('\n');

    const logStr = await this.git.logsBetweenTags(JiraSchedule.PROJECT_NAME, tags[1], tags[0]);
    const issueIds = JiraSchedule.parseLogStr(logStr);
    this.logger.log('Issues===='+issueIds.join(','));

    return issueIds;
  }


  private static parseLogStr(logStr): string[] {
    const reg = /(sa|#)(\d+)]/gi;
    const matches = [...logStr.matchAll(reg)]
    return matches.map(match  => match[2]);
  }
}
