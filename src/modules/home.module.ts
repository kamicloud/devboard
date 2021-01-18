import { CacheModule, Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { ReleaseController } from '../controllers/home/release.controller';
import { SharedModule } from './shared.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { KanbanController } from '../controllers/home/kanban.controller';
import { TestController } from '../controllers/home/test.controller';
import { DeployController } from '../controllers/home/deploy.controller';
import { DatabaseModule } from './database.module';
import { SharedHttpModule } from './shared-http.module';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   load: [configuration],
    // }),
    CacheModule.register(),
    DatabaseModule.forRoot(),
    SharedHttpModule,
  ],
  controllers: [
    AppController,
    DeployController,
    KanbanController,
    ReleaseController,
    TestController,
  ],
  providers: [
  ],
})
export class HomeModule {}
