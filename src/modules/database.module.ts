import { Module } from '@nestjs/common';
import { databaseProviders, repositoryProviders } from '../providers/database.provider';

@Module({
  providers: [
    ...databaseProviders,
    ...repositoryProviders,
  ],
  exports: [
    ...databaseProviders,
    ...repositoryProviders,
  ],
})
export class DatabaseModule {}
