import { Module } from '@nestjs/common';
import fs from 'fs';
import { LoggerModule } from 'nestjs-pino';
import { ConsoleModule } from 'nestjs-console';
import { TasksSchedule } from './schedules/tasks.schedule';
import { SharedModule } from '../modules/shared.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { JiraCommand } from './commands/tool/jira.command';
import { GithubCommand } from './commands/tool/github.command';

const providers = [
  GithubCommand,
  JiraCommand,
  TasksSchedule,
];

const testCommand = __dirname + '/commands/test.command.ts';

if (fs.existsSync(testCommand)) {
  providers.push(require(testCommand).TestCommand);
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot(),
    SharedModule.forRoot(),
    ConsoleModule,
  ],
  providers,
  exports: providers,
})
export class CommandModule {}
