import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantInfo } from './entities/restaurant-info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantInfo])
  ],
  exports: [TypeOrmModule]
})
export class RestaurantModule {}