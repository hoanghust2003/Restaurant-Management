import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async findAll(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.suppliersService.findAll(include);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.suppliersService.findOne(id, include);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async create(@Body() createSupplierDto: CreateSupplierDto, @Request() req) {
    return this.suppliersService.create(createSupplierDto, req.user.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto, @Request() req) {
    return this.suppliersService.update(id, updateSupplierDto, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async remove(@Param('id') id: string, @Request() req) {
    await this.suppliersService.remove(id, req.user.role);
    return { message: 'Đã xóa nhà cung cấp thành công' };
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async restore(@Param('id') id: string, @Request() req) {
    await this.suppliersService.restore(id, req.user.role);
    return { message: 'Đã khôi phục nhà cung cấp thành công' };
  }
}
