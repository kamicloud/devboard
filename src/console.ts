import { BootstrapConsole } from 'nestjs-console';
import { CommandModule } from './modules/command.module';

const bootstrap = new BootstrapConsole({
  module: CommandModule,
  useDecorators: true
});
bootstrap.init().then(async (app) => {
  try {
    // init your app
    await app.init();
    // boot the cli
    await bootstrap.boot();
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
});
