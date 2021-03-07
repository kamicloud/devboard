import { NestFactory } from '@nestjs/core';
import { ServerModule } from 'src/modules/server.module';

async function bootstrap() {
  const app = await NestFactory.create(ServerModule);
  await app.listen(3000);
}
bootstrap();
