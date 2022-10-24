import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ConfigUtil from '../utils/config.util';
import git from 'simple-git';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import { trimEnd } from 'lodash';
import { Logger } from 'nestjs-pino';

@Injectable()
export class NodegitService {
  constructor(
    private configService: ConfigService,
    private configUtil: ConfigUtil,
    private logger: Logger,
  ) {
  }

  public async getRepositoryCommits(repository: string, branch: string, perpage = 50, page = 1) {
    const repo = await this.openRepo(repository);
    const commits = [];

    const addCommitDTO = (commit) => {
      const author = commit.author();
      commits.push({
        author: {
          name: author.name(),
          email: author.email(),
        },
        sha: commit.sha(),
        date: commit.date(),
        message: commit.message(),
      });
    }

    let commit = await repo.getBranchCommit(branch);
    for (let i = perpage * (page - 1); i < perpage; i++) {
      addCommitDTO(commit)
      commit = await commit.parent(0);
    }

    return commits;
  }

  public async fetchAndPull(repoName) {
    const path = this.getRepoPath(repoName);
    const fetchResult = await git(path).fetch();
    this.logger.log(fetchResult, 'fetch result');

    const pullResult = await git(path).pull();
    this.logger.log(pullResult, 'pull result');
  }

  public async cloneRepository(repository, force = false) {
    return null;
  }

  public async listTags(repoName, pattern='*'):Promise<any[]> {
    return null;
  }

  private async openRepo(repoName) {
    return null;
  }

  private getRepoPath(repoName) {
    const config = this.configUtil.getRepositoryConfig(repoName);
    return './storage/repositories/' + config.name;
  }

  public async getRecentTags(repoName, pattern='*', count=5):Promise<string> {
    const path = this.getRepoPath(repoName);
    return await git(path).raw('for-each-ref', `refs/tags/${pattern}`, '--sort=-committerdate', `--count=${count}`, '--format=%(refname:short)');
  }

  public async logsBetweenTags(repoName, from, to):Promise<string> {
    const path = this.getRepoPath(repoName);
    return await git(path).raw('log', '--pretty=oneline', `${from}..${to}`);
  }

  public parseLogStr(logStr: string): string[] {
    const logs = trimEnd(logStr, '\n').split('\n');
    const reg = /(\/|\[)(help|sa|#)( |-)?(\d+)/gi;
    const keys = [];

    for (const log of logs) {
      this.logger.log('parseLogStr==' + log);
      const matches = [...log.matchAll(reg)];
      if (isEmpty(matches)) continue;
      const logKeys = matches.map(match => match[4]);
      keys.push(...logKeys)
      this.logger.log('LogKeys==' + logKeys.join(','));
    }

    return keys;
  }
}
