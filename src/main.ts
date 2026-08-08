import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { initFirebase } from './common/firebase.init';

async function bootstrap() {
  initFirebase();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ── Security ────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:3000', 'capacitor://localhost', 'ionic://localhost'],
    credentials: true,
  });

  // ── Global Prefix ────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Validation ───────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── WebSocket ────────────────────────────────────────────────
  app.useWebSocketAdapter(new IoAdapter(app));

  // ── Swagger ──────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Brain Planet API')
    .setDescription('Backend API for the Brain Planet mobile app')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User profile management')
    .addTag('planet', 'Planet state and health')
    .addTag('focus', 'Focus sessions')
    .addTag('usage', 'Social media usage tracking')
    .addTag('missions', 'Daily and weekly missions')
    .addTag('rewards', 'Unlockable rewards')
    .addTag('analytics', 'Usage analytics')
    .addTag('notifications', 'Push notifications')
    .addTag('leaderboard', 'Global rankings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ── Start ────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Brain Planet API running on http://localhost:${port}/api`);
  logger.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
