import { CacheModule, Module } from '@nestjs/common';
import { DeployManager } from '../managers/deploy.manager';
import { DatabaseModule } from './database.module';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    CacheModule.register(),
    DatabaseModule.forRoot(),
    SharedModule.forRoot(),
  ],
  providers: [
    DeployManager,
  ],
  exports: [
    DeployManager,
  ],
})
export class SharedHttpModule { }
