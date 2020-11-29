import { Module } from '@nestjs/common';
import { ReleaseController } from '../controllers/api/release.controller';
import { KanbanController } from '../controllers/api/kanban.controller';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    SharedModule,
  ],
  controllers: [
    KanbanController,
    ReleaseController,
  ],
})
export class ApiModule {}
