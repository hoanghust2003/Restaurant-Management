import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Dish } from '../entities/dish.entity';
import { DishIngredient } from '../entities/dish-ingredient.entity';
import { DishesController } from './dishes.controller';
import { DishesService } from './dishes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dish, DishIngredient]),
    JwtModule
  ],
  controllers: [DishesController],
  providers: [DishesService],
  exports: [DishesService],
})
export class DishesModule {}
