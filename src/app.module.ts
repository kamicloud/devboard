import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { RenderModule } from 'nest-next';
import Next from 'next';
import { ReleaseController } from './controllers/release.controller';

@Module({
  imports: [
    RenderModule.forRootAsync(Next({ dev: process.env.NODE_ENV !== 'production' })),
  ],
  controllers: [
    AppController,
    ReleaseController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}
