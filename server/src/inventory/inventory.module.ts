import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { Batch } from '../entities/batch.entity';
import { Supplier } from '../entities/supplier.entity';
import { IngredientImport } from '../entities/ingredient-import.entity';
import { IngredientExport } from '../entities/ingredient-export.entity';
import { ExportItem } from '../entities/export-item.entity';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { BatchesModule } from '../batches/batches.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ingredient, 
      Batch, 
      Supplier, 
      IngredientImport, 
      IngredientExport, 
      ExportItem
    ]),
    IngredientsModule,
    SuppliersModule,
    BatchesModule,
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
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
