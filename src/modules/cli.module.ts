import { Module } from '@nestjs/common';
import Next from 'next';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { CommandService } from '../console/command.service';
import { ConsoleModule } from 'nestjs-console';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    ConsoleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    SharedModule,
  ],
  providers: [
    // ConsoleService,
    CommandService,
  ],
  exports: [
    // ConsoleService,
    CommandService,
  ]
})
export class CliModule {}
