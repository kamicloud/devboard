import { CacheModule, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/services/configuration';
import { SharedModule } from './shared.module';
import { scheduleProvider } from '../providers/schedule.provider';
import pino from 'pino';

const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration],
  }),
  LoggerModule.forRoot({
    pinoHttp: {
      stream: pino.destination({
        dest: './logger.log', // omit for stdout
        minLength: 4096, // Buffer before writing
        sync: false, // Asynchronous logging
      }),
    }
  }),
  CacheModule.register(),
  SharedModule.forRoot(),
  ScheduleModule.forRoot(),
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
