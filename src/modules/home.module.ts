import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { RenderModule } from 'nest-next';
import { AppService } from '../services/app.service';
import Next from 'next';
import { ReleaseController } from '../controllers/release.controller';
import { SharedModule } from './shared.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { KanbanController } from '../controllers/home/kanban.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    SharedModule,
  ],
  controllers: [
    KanbanController,
  ],
})
export class HomeModule {}
