import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('retag-server/api');

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  await app.listen(Number(process.env.PORT ?? 3001), '0.0.0.0');
}
void bootstrap();
