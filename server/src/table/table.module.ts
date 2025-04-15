import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import { Table } from './entities/table.entity';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Table]),
    OrderModule
  ],
  controllers: [TableController],
  providers: [TableService],
  exports: [TypeOrmModule, TableService],
})
export class TableModule {}