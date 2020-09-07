import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import Next from 'next';
import { ReleaseController } from '../controllers/release.controller';
import { SharedModule } from '../shared.module';

@Module({
  imports: [
    SharedModule,
  ],
  controllers: [
    AppController,
    ReleaseController,
  ],
})
export class ApiModule {}
