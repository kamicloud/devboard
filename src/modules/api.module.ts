import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { RenderModule } from 'nest-next';
import { AppService } from '../services/app.service';
import Next from 'next';
import { ReleaseController } from '../controllers/release.controller';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    RenderModule.forRootAsync(Next({ dev: process.env.NODE_ENV !== 'production' })),
    SharedModule,
  ],
  controllers: [
    AppController,
    ReleaseController,
  ],
})
export class ApiModule {}
