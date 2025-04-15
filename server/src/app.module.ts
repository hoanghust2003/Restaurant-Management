// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './order/order.module';
import { MenuItemModule } from './menu-item/menu-item.module';
import { TableModule } from './table/table.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: process.env.DB_NAME || 'restaurant_management',
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production', // chỉ dùng trong dev!
      }),
    }),
    OrderModule,
    MenuItemModule,
    TableModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
