import { GitDeployHistory } from '../entities/GitDeployHistory.entity';
import { createConnection } from 'typeorm';
import { Connection, Repository } from 'typeorm';
import config from '../config/configuration';
import { GitHotfixedCommit } from '../entities/GitHotfixedCommit.entity';

export const databaseProviders = [
  {
    isGlobal: true,
    provide: 'DATABASE_CONNECTION',
    useFactory: async () => await createConnection({
      type: 'mysql',
      port: 3306,
      ...config().database,
      entities: [
          __dirname + '/../**/*.entity{.ts,.js}',
      ],
      synchronize: false,
    }),
  },
];

export const repositoryProviders = [
  {
    isGlobal: true,
    provide: 'GIT_DEPLOY_HISTORY_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(GitDeployHistory),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    isGlobal: true,
    provide: 'GIT_HOTFIXED_COMMIT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(GitHotfixedCommit),
    inject: ['DATABASE_CONNECTION'],
  },
];
