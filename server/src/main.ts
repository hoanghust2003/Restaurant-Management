import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get allowed origins from environment or use defaults
  const allowedOriginsStr = process.env.ALLOWED_ORIGINS;
  let allowedOrigins: boolean | string[] = ['http://localhost:3000', 'http://localhost:4200'];
  
  if (allowedOriginsStr) {
    const originsFromEnv = allowedOriginsStr.split(',').map(origin => origin.trim());
    if (originsFromEnv.includes('*')) {
      // If wildcard is specified, allow all origins
      allowedOrigins = true;
    } else {
      // Otherwise use the specified origins
      allowedOrigins = originsFromEnv;
    }
  }
  
  // Cấu hình global
  app.setGlobalPrefix('api'); // Thêm tiền tố 'api' cho tất cả các endpoint
  
  // Configure CORS with detailed options
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    exposedHeaders: ['Content-Disposition'], // Add necessary exposed headers
  });
  
  // Cấu hình validation pipe để tự động validate DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
    forbidNonWhitelisted: true, // Trả về lỗi khi có thuộc tính không được định nghĩa
    transform: true, // Tự động chuyển đổi dữ liệu đầu vào theo DTO
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();
