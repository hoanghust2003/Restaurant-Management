import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/typeorm.config';
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
import { CustomerModule } from './customer/customer.module';
import { ConfigModule } from '@nestjs/config';
import { FileUploadModule } from './file-upload/file-upload.module';
import { CategoriesModule } from './categories/categories.module';
import { EventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StaticFilesMiddleware } from './common/middlewares/static-files.middleware';
import { StaticAssetsController } from './common/controllers/static-assets.controller';
import * as path from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.resolve(process.cwd(), '.env')],
      cache: false, // Disable cache to make sure we always read the latest values
      expandVariables: true, // Allow variable expansion in .env file
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UsersModule,
    RestaurantsModule,
    IngredientsModule,
    AuthModule,
    TablesModule,
    DishesModule,
    MenusModule,
    OrdersModule,
    KitchenModule,
    CustomerModule,
    BatchesModule,
    SuppliersModule,    
    InventoryModule,
    FinancialModule,
    ReportsModule,
    FileUploadModule,
    CategoriesModule,
    EventsModule,
    PaymentModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, StaticAssetsController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the StaticFilesMiddleware to all routes
    consumer
      .apply(StaticFilesMiddleware)
      .forRoutes('*');
  }
}
