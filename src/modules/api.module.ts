import { Module } from '@nestjs/common';
import { ReleaseController } from '../controllers/api/release.controller';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    SharedModule,
  ],
  controllers: [
    ReleaseController,
  ],
})
export class ApiModule {}
