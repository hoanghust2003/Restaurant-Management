import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportsService } from './exports.service';
import { IngredientExport } from '../entities/ingredient-export.entity';
import { ExportItem } from '../entities/export-item.entity';
import { Batch } from '../entities/batch.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IngredientExport, ExportItem, Batch]),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'restaurant_management_secure_jwt_secret_key_2025',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [ExportsService],
  exports: [ExportsService],
})
export class ExportsModule {}
