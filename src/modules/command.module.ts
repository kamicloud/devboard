import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConsoleModule } from 'nestjs-console';
import { SharedModule } from './shared.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/services/configuration';
import { JiraSchedule } from '../jira.schedule';
import {DatabaseModule} from "./database.module";

const providers = [
  JiraSchedule,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot(),
    DatabaseModule.forRoot(),
    SharedModule.forRoot(),
    ConsoleModule,
  ],
  providers,
  exports: providers,
})
export class CommandModule {}
