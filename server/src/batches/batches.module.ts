import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { Batch } from '../entities/batch.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { IngredientImport } from '../entities/ingredient-import.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { BatchAllocationService } from './batch-allocation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch, Ingredient, IngredientImport]),
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
  controllers: [BatchesController],
  providers: [BatchesService, BatchAllocationService],
  exports: [BatchesService, BatchAllocationService],
})
export class BatchesModule {}
