import { Module } from '@nestjs/common';
import { ReleaseController } from '../controllers/api/release.controller';
import { KanbanController } from '../controllers/api/kanban.controller';
import { DeployController } from '../controllers/api/deploy.controller';
import { SharedHttpModule } from './shared-http.module';

@Module({
  imports: [
    SharedHttpModule,
  ],
  controllers: [
    KanbanController,
    ReleaseController,
    DeployController,
  ],
  providers: [
  ],
})
export class ApiModule {}
