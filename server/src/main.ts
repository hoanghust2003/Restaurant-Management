// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Sử dụng ValidationPipe toàn cục với whitelist để loại bỏ các thuộc tính không được định nghĩa
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, // Tự động chuyển đổi các tham số đến đúng kiểu dữ liệu
      forbidNonWhitelisted: true, // Từ chối các thuộc tính không được định nghĩa trong DTO
    })
  );
  
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || true, // Cấu hình CORS linh hoạt hơn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap();
