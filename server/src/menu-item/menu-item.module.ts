import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from './menu-item.service';
import { MenuItem } from './entities/menu-item.entity';
import { MenuItemIngredient } from './entities/menu-item-ingredient.entity';
import { OrderModule } from '../order/order.module';
import { Dish } from './entities/dish.entity';
import { Category } from './entities/category.entity';
import { Menu } from './entities/menu.entity';
import { MenuDish } from './entities/menu-dish.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuItem, 
      MenuItemIngredient, 
      Dish, 
      Category, 
      Menu, 
      MenuDish,
      InventoryItem
    ]),
    OrderModule
  ],
  controllers: [MenuItemController],
  providers: [MenuItemService],
  exports: [TypeOrmModule, MenuItemService],
})
export class MenuItemModule {}