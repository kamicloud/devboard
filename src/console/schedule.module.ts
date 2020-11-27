import { Module } from '@nestjs/common';
import Next from 'next';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksSchedule } from './schedules/tasks.schedule';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { SharedModule } from '../modules/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot(),
    SharedModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    TasksSchedule,
  ],
  exports: [
  ]
})
export class AppModule {}
