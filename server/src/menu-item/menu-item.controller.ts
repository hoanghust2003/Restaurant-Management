import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItem, MenuItemCategory } from './entities/menu-item.entity';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../user/entities/user.entity';

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
}