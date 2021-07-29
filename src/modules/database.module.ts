import { DynamicModule, Module } from '@nestjs/common';
import { databaseProviders } from '../providers/database.provider';

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
