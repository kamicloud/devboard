import { CacheModule, Module } from '@nestjs/common';
import { DeployManager } from '../managers/deploy.manager';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    CacheModule.register(),
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
