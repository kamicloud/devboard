import { Module } from '@nestjs/common';
import { ReleaseController } from '../controllers/api/release.controller';
import { KanbanController } from '../controllers/api/kanban.controller';
import { SharedModule } from './shared.module';
import { DeployController } from '../controllers/api/deploy.controller';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    SharedModule,
    DatabaseModule,
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
