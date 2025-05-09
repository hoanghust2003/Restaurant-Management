import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  logger.log(`PORT from process.env: ${process.env.PORT}`);
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Lấy allowed origins từ biến môi trường hoặc sử dụng defaults
  const allowedOriginsStr = configService.get<string>('ALLOWED_ORIGINS');
  let allowedOrigins: boolean | string[] = ['http://localhost:3000', 'http://localhost:4200'];
  
  if (allowedOriginsStr) {
    const originsFromEnv = allowedOriginsStr.split(',').map(origin => origin.trim());
    if (originsFromEnv.includes('*')) {
      // Nếu wildcard được chỉ định, cho phép tất cả các nguồn gốc
      allowedOrigins = true;
    } else {
      // Ngược lại, sử dụng các nguồn gốc được chỉ định
      allowedOrigins = originsFromEnv;
    }
  }
  
  // Cấu hình global
  app.setGlobalPrefix('api'); // Thêm tiền tố 'api' cho tất cả các endpoint
  
  // Cấu hình CORS với các tùy chọn chi tiết
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    exposedHeaders: ['Content-Disposition'], // Thêm exposed headers cần thiết
  });
  
  // Cấu hình validation pipe để tự động validate DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
    forbidNonWhitelisted: true, // Trả về lỗi khi có thuộc tính không được định nghĩa
    transform: true, // Tự động chuyển đổi dữ liệu đầu vào theo DTO
  }));
  // Get port from environment variables or use default
  const port = configService.get('PORT') || 8000;
  
  logger.log(`Attempting to start server on port ${port}`);
  try {
    await app.listen(port);
    logger.log(`Application is running on port ${port}`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      // Nếu port đang được sử dụng, thử port khác
      const alternativePort = 8080;
      logger.warn(`Port ${port} đã được sử dụng. Đang thử port ${alternativePort}...`);
      await app.listen(alternativePort);
      logger.log(`Application is running on port ${alternativePort}`);
    } else {
      // Ném lỗi nếu là lỗi khác
      logger.error(`Failed to start server: ${error.message}`);
      throw error;
    }
  }
}
bootstrap();
