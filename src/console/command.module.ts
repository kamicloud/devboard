import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { TestCommand } from './commands/test.command';
import { ConsoleModule } from 'nestjs-console';
import { TasksSchedule } from './schedules/tasks.schedule';
import { SharedModule } from '../modules/shared.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';

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
    TestCommand,
    TasksSchedule,
  ],
  exports: [
    TestCommand,
    TasksSchedule,
  ],
})
export class CommandModule {}
