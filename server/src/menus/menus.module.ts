import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from '../entities/menu.entity';
import { MenuDish } from '../entities/menu-dish.entity';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, MenuDish]),
    FileUploadModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'restaurant_management_secure_jwt_secret_key',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') || '30d' 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService]
})
export class MenusModule {}
