import { CacheModule, Module } from '@nestjs/common';
import Next from 'next';
import { LoggerModule } from 'nestjs-pino';
import { ApiModule } from './api.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksSchedule } from '../console/schedules/tasks.schedule';
import { CacheSchedule } from '../console/schedules/cache.schedule';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { HomeModule } from './home.module';
import { RenderModule } from 'nest-next';
import { SharedModule } from './shared.module';
import { scheduleProvider } from '../providers/schedule.provider';
import pino from 'pino';

const imports = [
  RenderModule.forRootAsync(Next({ dev: process.env.NODE_ENV !== 'production' })),
  ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration],
  }),
  LoggerModule.forRoot({
    pinoHttp: {
      stream: pino.destination({
        dest: './storage/logs/logger.log', // omit for stdout
        minLength: 4096, // Buffer before writing
        sync: false, // Asynchronous logging
      }),
    }
  }),
  CacheModule.register(),
  SharedModule.forRoot(),
  ScheduleModule.forRoot(),
  ApiModule,
  HomeModule,
];

const providers = [
  ...scheduleProvider
];

@Module({
  imports,
  providers,
  exports: providers
})
export class ServerModule { }
