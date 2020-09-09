import { Module } from '@nestjs/common';
import Next from 'next';
import { ApiModule } from './api.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from '../services/tasks.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    ApiModule,
  ],
  providers: [
    TasksService,
  ],
  exports: [
  ]
})
export class AppModule {}
