import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Table } from '../table/entities/table.entity';
import { MenuItem } from '../menu-item/entities/menu-item.entity';
import { Feedback } from './entities/feedback.entity';
import { KitchenLog } from './entities/kitchen-log.entity';
import { Dish } from '../menu-item/entities/dish.entity';
import { MenuItemIngredient } from '../menu-item/entities/menu-item-ingredient.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order, 
      OrderItem, 
      Table, 
      MenuItem, 
      Feedback, 
      KitchenLog,
      Dish,
      MenuItemIngredient,
      InventoryTransaction,
      InventoryItem
    ])
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderGateway],
  exports: [OrderService, OrderGateway],
})
export class OrderModule {}