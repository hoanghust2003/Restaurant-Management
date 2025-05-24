import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { OrdersModule } from '../orders/orders.module';
import { TablesModule } from '../tables/tables.module';

@Module({
  imports: [OrdersModule, TablesModule],
  controllers: [CustomerController],
})
export class CustomerModule {}
