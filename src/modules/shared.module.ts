import { Module } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { ReleasesService } from '../services/releases.service';

@Module({
  providers: [
    ReleasesService,
    AppService,
  ],
  exports: [
    ReleasesService,
    AppService,
  ],
})
export class SharedModule {}
