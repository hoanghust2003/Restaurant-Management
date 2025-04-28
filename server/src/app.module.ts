import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { AuthModule } from './auth/auth.module';
import { TablesModule } from './tables/tables.module';
import { DishesModule } from './dishes/dishes.module';
import { MenusModule } from './menus/menus.module';
import { OrdersModule } from './orders/orders.module';
import { KitchenModule } from './kitchen/kitchen.module';
import { BatchesModule } from './batches/batches.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { InventoryModule } from './inventory/inventory.module';
import { FinancialModule } from './financial/financial.module';
import { ReportsModule } from './reports/reports.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),

    UsersModule,
    RestaurantsModule,
    IngredientsModule,
    AuthModule,
    TablesModule,
    DishesModule,
    MenusModule,
    OrdersModule,
    KitchenModule,
    BatchesModule,
    SuppliersModule,
    InventoryModule,
    FinancialModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
