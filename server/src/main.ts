import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import {
  LEGACY_UPLOADS_DIR,
  LEGACY_UPLOADS_PREFIX,
} from './uploads/uploads.constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('retag-server/api');

  app.useStaticAssets(join(process.cwd(), LEGACY_UPLOADS_DIR), {
    prefix: LEGACY_UPLOADS_PREFIX,
  });

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  await app.listen(Number(process.env.PORT ?? 3001), '0.0.0.0');
}
void bootstrap();
