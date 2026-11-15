import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import {
  UPLOADS_DIR,
  UPLOADS_PUBLIC_PREFIX,
} from './uploads/uploads.constants';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('retag-server/api');

  app.useStaticAssets(join(process.cwd(), UPLOADS_DIR), {
    prefix: UPLOADS_PUBLIC_PREFIX,
  });

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  await app.listen(Number(process.env.PORT ?? 3001), '0.0.0.0');
}
void bootstrap();
