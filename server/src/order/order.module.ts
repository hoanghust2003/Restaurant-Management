import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Table } from '../table/entities/table.entity';
import { MenuItem } from '../menu-item/entities/menu-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Table, MenuItem])
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderGateway],
  exports: [OrderService, OrderGateway],
})
export class OrderModule {}