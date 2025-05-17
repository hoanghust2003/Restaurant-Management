import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto, UpdateIngredientDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}
  @Get()
  async findAll(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.ingredientsService.findAll(include);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.ingredientsService.findOne(id, include);
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async create(@Body() createIngredientDto: CreateIngredientDto, @Request() req) {
    return this.ingredientsService.create(createIngredientDto, req.user.role);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @Request() req,
  ) {
    return this.ingredientsService.update(id, updateIngredientDto, req.user.role);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async remove(@Param('id') id: string, @Request() req) {
    await this.ingredientsService.remove(id, req.user.role);
    return { message: 'Đã xóa nguyên liệu thành công' };
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async restore(@Param('id') id: string, @Request() req) {
    await this.ingredientsService.restore(id, req.user.role);
    return { message: 'Đã khôi phục nguyên liệu thành công' };
  }
}
