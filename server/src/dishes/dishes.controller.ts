import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseBoolPipe, DefaultValuePipe } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from '../entities/dish.entity';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  create(@Body() createDishDto: CreateDishDto): Promise<Dish> {
    return this.dishesService.create(createDishDto);
  }

  @Get()
  findAll(
    @Query('includeDeleted', new DefaultValuePipe(false), ParseBoolPipe) includeDeleted: boolean,
  ): Promise<Dish[]> {
    return this.dishesService.findAll(includeDeleted);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('includeDeleted', new DefaultValuePipe(false), ParseBoolPipe) includeDeleted: boolean,
  ): Promise<Dish> {
    return this.dishesService.findOne(id, includeDeleted);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto): Promise<Dish> {
    return this.dishesService.update(id, updateDishDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.dishesService.remove(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string): Promise<Dish> {
    return this.dishesService.restore(id);
  }

  @Delete(':id/hard')
  hardDelete(@Param('id') id: string): Promise<void> {
    return this.dishesService.hardDelete(id);
  }
}
