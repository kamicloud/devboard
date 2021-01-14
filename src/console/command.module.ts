import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { TestCommand } from './commands/test.command';
import { ConsoleModule } from 'nestjs-console';
import { TasksSchedule } from './schedules/tasks.schedule';
import { SharedModule } from '../modules/shared.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitDeployHistory } from 'src/entities/GitDeployHistory.entity';
import { JiraCommand } from './commands/tool/jira.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot(),
    ConsoleModule,
    SharedModule,
  ],
  providers: [
    JiraCommand,
    TestCommand,
    TasksSchedule,
  ],
  exports: [
    JiraCommand,
    TestCommand,
    TasksSchedule,
  ],
})
export class CommandModule {}
