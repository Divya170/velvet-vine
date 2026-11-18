import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { UPLOAD_DIR } from './common/upload';
import { createValidationPipe } from './common/validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map((o) => o.trim()).filter(Boolean);
  // Behind a proxy, set TRUST_PROXY=1 so the inquiry rate limit sees real client IPs.
  if (process.env.TRUST_PROXY) app.set('trust proxy', 1);
  app.enableCors({ origin: origins, credentials: false });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(createValidationPipe());
  app.useStaticAssets(UPLOAD_DIR, { prefix: '/uploads/', maxAge: '30d' });
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  Logger.log(`Velvet Vine API running on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();
