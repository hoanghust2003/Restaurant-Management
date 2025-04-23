import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { Ingredient } from './entities/ingredient.entity';
import { Unit } from './entities/unit.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { UserModule } from '../user/user.module';
import { Dish } from '../menu-item/entities/dish.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryItem, 
      InventoryTransaction, 
      Ingredient, 
      Unit, 
      DishIngredient,
      Dish
    ]),
    UserModule
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService, TypeOrmModule],
})
export class InventoryModule {}
