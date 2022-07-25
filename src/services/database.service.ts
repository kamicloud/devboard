import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Logger } from "nestjs-pino";
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { JiraService } from './jira.service';
import { JenkinsService } from './jenkins.service';
import { GithubService } from './github.service';
import { createConnection, Connection, Brackets } from 'typeorm';
import { GitDeployHistory } from '../entities/GitDeployHistory.entity';
import { GitHotfixedCommit } from '../entities/GitHotfixedCommit.entity';
import config from '../config/configuration';

type CacheType = Cache;

@Injectable()
export class DatabaseService {

  private connection: Connection | null;

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly jenkinsService: JenkinsService,
    private readonly jiraService: JiraService,
    private readonly githubService: GithubService,
    @Inject(CACHE_MANAGER)
    private cacheManager: CacheType
  ) {
    this.boot();
  }

  async boot() {
    if (!config().database.enabled) {
      return;
    }

    if (this.connection && this.connection.isConnected) {
      return;
    }

    try {
      this.connection = await createConnection({
        type: 'mysql',
        port: 3306,
        ...config().database,
        entities: [
          __dirname + '/../entities/*.entity{.ts,.js}',
        ],
        synchronize: false,
      })
    } catch (e) {
    }
  }

  async getHotfixedCommits(project: string) {
    if (!this.connection) {
      return [];
    }

    const gitHotfixedCommits = await this.connection.manager
      .getRepository(GitHotfixedCommit)
      .find({
        where: {
          repository: project,
        },
      });

    return gitHotfixedCommits
  }

  async getLatestDeployHistories(project: string, branch: string) {
    if (!this.connection) {
      return [];
    }

    const gitDeployHistories = await this.connection.manager
      .getRepository(GitDeployHistory)
      .find({
        where: {
          repository: project,
          branch,
        },
        order: {
          id: 'DESC'
        },
        take: 1000,
      });

    return gitDeployHistories;
  }

  async getReleaseBranch(project: string, release: string) {
    if (!this.connection) {
      return null;
    }

    const gitDeployHistory = await this.connection.manager.getRepository(GitDeployHistory)
      .createQueryBuilder()
      .where('repository=:repository', { repository: project })
      .where('`release`=:release', { release })
      .getOne();

    return gitDeployHistory;
  }

  async getDeployHistories(project: string, branch: string, site: string, sites: any) {
    if (!this.connection) {
      return [];
    }

    const gitDeployHistories = await this.connection.manager
      .getRepository(GitDeployHistory)
      .createQueryBuilder()
      .where(new Brackets(qb => {
        qb.andWhere('repository=:repository', { repository: project })
        qb.andWhere('site_name=:siteName', { siteName: site });
        if (sites.live.indexOf(site) === -1) {
          qb.andWhere('branch=:branch', { branch })
        }
        qb.andWhere('is_hidden=:isHidden', { isHidden: false })
      }))
      .orderBy('id', 'DESC')
      .limit(20)
      .getMany();

    return gitDeployHistories;
  }

  async getReleaseDeployingHistories(project: string) {
    if (!this.connection) {
      return [];
    }

    const deployHistories = await this.connection.manager
      .getRepository(GitDeployHistory)
      .createQueryBuilder()
      .where(new Brackets(qb => {
        qb.andWhere('repository=:repostiory', { repostiory: project })
        qb.andWhere('deployment_status=:deploymentStatus', { deploymentStatus: 'deploying' })
        qb.andWhere('`release`<>:release', { release: '' })
      }))
      .getMany();

    return deployHistories;
  }

  async updateDeployHistoryStatus(deployHistory: GitDeployHistory, deploymentStatus) {
    if (!this.connection) {
      return;
    }

    await this.connection.manager
      .getRepository(GitDeployHistory)
      .createQueryBuilder()
      .update()
      .whereEntity(deployHistory)
      .set({
        deploymentStatus
      })
      .execute()
  }
}
