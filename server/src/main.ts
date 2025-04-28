import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Cấu hình global
  app.setGlobalPrefix('api'); // Thêm tiền tố 'api' cho tất cả các endpoint
  app.enableCors(); // Cho phép CORS
  
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
