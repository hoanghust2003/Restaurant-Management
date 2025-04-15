import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { OrderModule } from '../order/order.module';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from './menu-item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItem]),
    OrderModule
  ],
  controllers: [MenuItemController],
  providers: [MenuItemService],
  exports: [TypeOrmModule, MenuItemService],
})
export class MenuItemModule {}