import { DynamicModule, Module } from '@nestjs/common';
import {createConnection} from "typeorm";
import config from "../services/configuration";

@Module({
  providers: [
  ],
  exports: [
  ],
})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const providers = [
      ...databaseProviders,
    ]
    return {
      global: true,
      module: DatabaseModule,
      providers,
      exports: providers,
    };
  }
}

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
