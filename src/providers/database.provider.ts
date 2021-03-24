import { createConnection } from 'typeorm';
import config from '../config/configuration';

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
