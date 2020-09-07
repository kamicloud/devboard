import { Module } from '@nestjs/common';
import { RenderModule } from 'nest-next';
import Next from 'next';
import { ApiModule } from './modules/api.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './services/tasks.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    RenderModule.forRootAsync(Next({ dev: process.env.NODE_ENV !== 'production' })),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    ApiModule,
  ],
  providers: [
    TasksService,
  ]
})
export class AppModule {}
