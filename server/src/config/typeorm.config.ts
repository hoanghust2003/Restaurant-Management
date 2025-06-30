import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';

// Cấu hình cố định (fallback) - không nên sử dụng trực tiếp
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'restaurant_db',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: false, // chỉ dùng synchronize: true trong môi trường phát triển
};

// Cấu hình không đồng bộ sử dụng ConfigService - nên sử dụng
export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'postgres',
      host: configService.get('DB_HOST', 'localhost'),
      port: configService.get('DB_PORT', 5432),
      username: configService.get('DB_USERNAME', 'postgres'),
      password: configService.get('DB_PASSWORD', 'postgres'),
      database: configService.get('DB_DATABASE', 'restaurant_db'),
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
      synchronize: configService.get('NODE_ENV', 'development') === 'development',
      ssl: configService.get('DB_SSL') === 'true' ? {
        rejectUnauthorized: false
      } : false,
    };
  },
};
