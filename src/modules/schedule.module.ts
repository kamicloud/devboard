import { Module } from '@nestjs/common';
import Next from 'next';
import { ApiModule } from './api.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from '../console/tasks.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    SharedModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    TasksService,
  ],
  exports: [
  ]
})
export class AppModule {}
