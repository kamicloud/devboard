import {Injectable} from '@nestjs/common';
import {Brackets, Connection, createConnection} from 'typeorm';
import {GitDeployHistory} from '../entities/GitDeployHistory.entity';
import config from './configuration';

@Injectable()
export class DatabaseService {

  private connection: Connection | null;

  constructor() {
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

  async getReleaseBranch(project: string, release: string) {
    if (!this.connection) {
      return null;
    }

    return await this.connection.manager.getRepository(GitDeployHistory)
      .createQueryBuilder()
      .where('repository=:repository', {repository: project})
      .where('`release`=:release', {release})
      .getOne();
  }

  async getReleaseDeployingHistories(project: string) {
    if (!this.connection) {
      return [];
    }

    return await this.connection.manager
      .getRepository(GitDeployHistory)
      .createQueryBuilder()
      .where(new Brackets(qb => {
        qb.andWhere('repository=:repostiory', {repostiory: project})
        qb.andWhere('deployment_status=:deploymentStatus', {deploymentStatus: 'deploying'})
        qb.andWhere('`release`<>:release', {release: ''})
      }))
      .getMany();
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
