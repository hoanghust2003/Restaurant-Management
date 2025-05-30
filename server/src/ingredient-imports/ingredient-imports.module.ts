import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientImportsController } from './ingredient-imports.controller';
import { IngredientImportsService } from './ingredient-imports.service';
import { IngredientImport } from '../entities/ingredient-import.entity';
import { Batch } from '../entities/batch.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { Supplier } from '../entities/supplier.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { BatchesModule } from '../batches/batches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IngredientImport, Batch, Ingredient, Supplier]),
    AuthModule,
    BatchesModule,
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
  controllers: [IngredientImportsController],
  providers: [IngredientImportsService],
  exports: [IngredientImportsService],
})
export class IngredientImportsModule {}
