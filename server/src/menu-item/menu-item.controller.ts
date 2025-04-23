import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItem, MenuItemCategory } from './entities/menu-item.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateMenuItemIngredientsDto, MenuItemIngredientDto } from './dto/menu-item-ingredient.dto';

@Controller('menu-items')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemService.create(createMenuItemDto);
  }

  @Get()
  findAll() {
    return this.menuItemService.findAll();
  }

  @Get('available')
  findAvailable() {
    return this.menuItemService.findAvailable();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: MenuItemCategory) {
    return this.menuItemService.findByCategory(category);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemService.update(id, updateMenuItemDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/availability')
  updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query('isAvailable') isAvailable: boolean,
  ) {
    return this.menuItemService.updateAvailability(id, isAvailable);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemService.remove(id);
  }

  // Endpoints quản lý nguyên liệu cho món ăn
  @UseGuards(AuthGuard('jwt'))
  @Post('ingredients')
  addIngredients(@Body() createIngredientsDto: CreateMenuItemIngredientsDto) {
    return this.menuItemService.addIngredients(createIngredientsDto);
  }

  @Get(':id/ingredients')
  getMenuItemIngredients(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemService.getMenuItemIngredients(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':menuItemId/ingredients/:ingredientId')
  updateIngredient(
    @Param('menuItemId', ParseIntPipe) menuItemId: number,
    @Param('ingredientId', ParseIntPipe) ingredientId: number,
    @Body() updateData: MenuItemIngredientDto,
  ) {
    return this.menuItemService.updateIngredient(menuItemId, ingredientId, updateData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':menuItemId/ingredients/:ingredientId')
  removeIngredient(
    @Param('menuItemId', ParseIntPipe) menuItemId: number,
    @Param('ingredientId', ParseIntPipe) ingredientId: number,
  ) {
    return this.menuItemService.removeIngredient(menuItemId, ingredientId);
  }
}