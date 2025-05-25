import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Response } from 'express';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const restaurants = await this.restaurantsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Restaurants retrieved successfully',
      data: restaurants,
    };
  }

  @Get('info')
  @HttpCode(HttpStatus.OK)
  async getRestaurantInfo(@Res({ passthrough: true }) response: Response) {
    const restaurant = await this.restaurantsService.getRestaurantInfo();

    // Set cache headers - cache for 5 minutes
    response.setHeader('Cache-Control', 'public, max-age=300');
    response.setHeader('ETag', `"${restaurant.id}-${Date.now()}"`);

    return {
      statusCode: HttpStatus.OK,
      message: 'Restaurant information retrieved successfully',
      data: restaurant,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const restaurant = await this.restaurantsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Restaurant retrieved successfully',
      data: restaurant,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRestaurantDto: CreateRestaurantDto) {
    const restaurant = await this.restaurantsService.create(createRestaurantDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Restaurant created successfully',
      data: restaurant,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    const restaurant = await this.restaurantsService.update(id, updateRestaurantDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Restaurant updated successfully',
      data: restaurant,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.restaurantsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Restaurant deleted successfully',
    };
  }
}
