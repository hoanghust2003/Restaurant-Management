import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { IngredientBatchesModule } from './ingredient-batches/ingredient-batches.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    RestaurantsModule,
    IngredientsModule,
    IngredientBatchesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
