import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseBoolPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from '../entities/dish.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@ApiTags('dishes')
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new dish' })
  @ApiResponse({ status: 201, description: 'Dish created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiBody({ type: CreateDishDto })
  create(@Body() createDishDto: CreateDishDto): Promise<Dish> {
    return this.dishesService.create(createDishDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dishes' })
  @ApiQuery({ name: 'includeDeleted', type: 'boolean', required: false, description: 'Include deleted dishes' })
  @ApiResponse({ status: 200, description: 'Returns list of all dishes' })
  findAll(
    @Query('includeDeleted', new DefaultValuePipe(false), ParseBoolPipe) includeDeleted: boolean,
  ): Promise<Dish[]> {
    return this.dishesService.findAll(includeDeleted);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dish by ID' })
  @ApiParam({ name: 'id', description: 'Dish ID', type: 'string' })
  @ApiQuery({ name: 'includeDeleted', type: 'boolean', required: false, description: 'Include deleted dishes' })
  @ApiResponse({ status: 200, description: 'Returns dish details' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  findOne(
    @Param('id') id: string,
    @Query('includeDeleted', new DefaultValuePipe(false), ParseBoolPipe) includeDeleted: boolean,
  ): Promise<Dish> {
    return this.dishesService.findOne(id, includeDeleted);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update dish' })
  @ApiParam({ name: 'id', description: 'Dish ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Dish updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  @ApiBody({ type: UpdateDishDto })
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto): Promise<Dish> {
    return this.dishesService.update(id, updateDishDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete dish (soft delete)' })
  @ApiParam({ name: 'id', description: 'Dish ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Dish deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.dishesService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore deleted dish' })
  @ApiParam({ name: 'id', description: 'Dish ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Dish restored successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  restore(@Param('id') id: string): Promise<Dish> {
    return this.dishesService.restore(id);
  }

  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Permanently delete dish' })
  @ApiParam({ name: 'id', description: 'Dish ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Dish permanently deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  hardDelete(@Param('id') id: string): Promise<void> {
    return this.dishesService.hardDelete(id);
  }
}
