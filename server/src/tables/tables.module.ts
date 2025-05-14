import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { TableEntity } from '../entities/table.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableEntity]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'restaurant_management_secure_jwt_secret_key_2025',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME', '1d') 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
