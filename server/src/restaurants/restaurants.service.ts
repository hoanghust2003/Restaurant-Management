import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  async findAll(): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const restaurant = this.restaurantRepository.create(createRestaurantDto);
    return await this.restaurantRepository.save(restaurant);
  }

  async update(id: string, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    Object.assign(restaurant, updateRestaurantDto);
    return await this.restaurantRepository.save(restaurant);
  }

  async remove(id: string): Promise<void> {
    const restaurant = await this.findOne(id);
    await this.restaurantRepository.remove(restaurant);
  }

  async getRestaurantInfo(): Promise<Restaurant> {
    const restaurants = await this.restaurantRepository.find({
      order: { created_at: 'ASC' },
      take: 1,
    });

    if (restaurants.length === 0) {
      throw new NotFoundException('No restaurant information found');
    }

    return restaurants[0];
  }
}
