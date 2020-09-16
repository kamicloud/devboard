import { Module } from '@nestjs/common';
import Next from 'next';
import { ApiModule } from './api.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from '../services/tasks.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { HomeModule } from './home.module';
import { RenderModule } from 'nest-next';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    RenderModule.forRootAsync(Next({ dev: process.env.NODE_ENV !== 'production' })),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    SharedModule,
    ScheduleModule.forRoot(),
    ApiModule,
    HomeModule,
  ],
  providers: [
    TasksService,
  ],
  exports: [
  ]
})
export class ServerModule {}
