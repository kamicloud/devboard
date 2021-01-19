import { DynamicModule, Module } from '@nestjs/common';
import { databaseProviders, repositoryProviders } from '../providers/database.provider';

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
      ...repositoryProviders,
    ]
    return {
      global: true,
      module: DatabaseModule,
      providers,
      exports: providers,
    };
  }
}
