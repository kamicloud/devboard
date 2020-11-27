import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { ReleaseController } from '../controllers/home/release.controller';
import { SharedModule } from './shared.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { KanbanController } from '../controllers/home/kanban.controller';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   load: [configuration],
    // }),
    SharedModule,
  ],
  controllers: [
    AppController,
    KanbanController,
    ReleaseController,
  ],
})
export class HomeModule {}
