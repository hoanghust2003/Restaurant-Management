import './polyfills';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketAdapter } from './events/websocket-adapter';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './swagger-config';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load dotenv as early as possible
const dotenvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(dotenvPath)) {
  dotenv.config({ path: dotenvPath });
  console.log('Loaded .env file from:', dotenvPath);
  console.log('.env contains PORT=', process.env.PORT);
} else {
  console.warn('No .env file found at:', dotenvPath);
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Set up WebSocket adapter with CORS support using the custom WebSocketAdapter
  app.useWebSocketAdapter(new WebSocketAdapter(app));

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Setup Swagger API Documentation
  const config = swaggerConfig;

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: (req: any) => {
        console.log('API Request:', req);
        return req;
      }
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 50px 0; }
      .swagger-ui .info .title { color: #3b82f6; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; }
    `,
    customSiteTitle: 'Restaurant Management API Documentation',
    customfavIcon: '/favicon.ico',
  });

  // Get port from config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8000;
  logger.log(`PORT from process.env: ${process.env.PORT}`);

  await app.listen(port);
  logger.log(`Attempting to start server on port ${port}`);
}

bootstrap();
