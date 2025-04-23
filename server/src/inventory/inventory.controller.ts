import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Unit management
  @Post('units')
  createUnit(@Body() createUnitDto: CreateUnitDto) {
    return this.inventoryService.createUnit(createUnitDto);
  }

  @Get('units')
  findAllUnits() {
    return this.inventoryService.findAllUnits();
  }

  @Get('units/:id')
  findOneUnit(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOneUnit(id);
  }

  @Patch('units/:id')
  updateUnit(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateUnitDto: UpdateUnitDto
  ) {
    return this.inventoryService.updateUnit(id, updateUnitDto);
  }

  @Delete('units/:id')
  removeUnit(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.removeUnit(id);
  }

  // Ingredient management
  @Post('ingredients')
  createIngredient(@Body() createIngredientDto: CreateIngredientDto) {
    return this.inventoryService.createIngredient(createIngredientDto);
  }

  @Get('ingredients')
  findAllIngredients() {
    return this.inventoryService.findAllIngredients();
  }

  @Get('ingredients/low-stock')
  findLowStockIngredients() {
    return this.inventoryService.findLowStockIngredients();
  }

  @Get('ingredients/expiring')
  findExpiringIngredients(@Query('days', ParseIntPipe) days: number = 7) {
    return this.inventoryService.findExpiringIngredients(days);
  }

  @Get('ingredients/:id')
  findOneIngredient(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOneIngredient(id);
  }

  @Patch('ingredients/:id')
  updateIngredient(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateIngredientDto: UpdateIngredientDto
  ) {
    return this.inventoryService.updateIngredient(id, updateIngredientDto);
  }

  @Delete('ingredients/:id')
  removeIngredient(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.removeIngredient(id);
  }

  // Dish-ingredient relationships
  @Get('dishes/:dishId/ingredients')
  getDishIngredients(@Param('dishId', ParseUUIDPipe) dishId: string) {
    return this.inventoryService.getDishIngredients(dishId);
  }

  @Post('dishes/:dishId/ingredients/:ingredientId')
  addIngredientToDish(
    @Param('dishId', ParseUUIDPipe) dishId: string,
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Body('quantity', ParseIntPipe) quantity: number
  ) {
    return this.inventoryService.addIngredientToDish(dishId, ingredientId, quantity);
  }

  @Patch('dishes/:dishId/ingredients/:ingredientId')
  updateDishIngredient(
    @Param('dishId', ParseUUIDPipe) dishId: string,
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Body('quantity', ParseIntPipe) quantity: number
  ) {
    return this.inventoryService.updateDishIngredient(dishId, ingredientId, quantity);
  }

  @Delete('dishes/:dishId/ingredients/:ingredientId')
  removeIngredientFromDish(
    @Param('dishId', ParseUUIDPipe) dishId: string,
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string
  ) {
    return this.inventoryService.removeIngredientFromDish(dishId, ingredientId);
  }

  // Dashboard and reporting
  @Get('summary')
  getInventorySummary() {
    return this.inventoryService.getInventorySummary();
  }
}
