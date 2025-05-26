import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Delete, Patch } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { CreateImportDto } from './dto/create-import.dto';
import { CreateExportDto } from './dto/create-export.dto';

import { BadRequestException } from '@nestjs/common';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getInventoryStats() {
    return this.inventoryService.getInventoryStats();
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.CHEF)
  async getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('expiring-soon')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getExpiringSoonItems(@Query('days') days: number = 30) {
    return this.inventoryService.getExpiringSoonItems(days);
  }

  @Get('imports/recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getRecentImports(@Query('limit') limit: number = 5) {
    return this.inventoryService.getRecentImports(limit);
  }

  @Get('imports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getAllImports(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getAllImports(include);
  }

  @Get('imports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getImportById(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getImportById(id, include);
  }

  @Post('imports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async createImport(@Body() createImportDto: CreateImportDto, @Request() req) {
    return this.inventoryService.createImport(createImportDto, req.user.id);
  }

  @Delete('imports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async removeImport(@Param('id') id: string, @Request() req) {
    await this.inventoryService.removeImport(id, req.user.role);
    return { message: 'Đã xóa phiếu nhập kho thành công' };
  }

  @Post('imports/:id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async restoreImport(@Param('id') id: string, @Request() req) {
    await this.inventoryService.restoreImport(id, req.user.role);
    return { message: 'Đã khôi phục phiếu nhập kho thành công' };
  }

  @Get('exports/recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getRecentExports(@Query('limit') limit: number = 5) {
    return this.inventoryService.getRecentExports(limit);
  }

  @Get('exports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getAllExports(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getAllExports(include);
  }

  @Get('exports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getExportById(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getExportById(id, include);
  }

  @Post('exports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async createExport(@Body() createExportDto: CreateExportDto, @Request() req) {
    return this.inventoryService.createExport(createExportDto, req.user.id);
  }

  @Delete('exports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async removeExport(@Param('id') id: string, @Request() req) {
    await this.inventoryService.removeExport(id, req.user.role);
    return { message: 'Đã xóa phiếu xuất kho thành công' };
  }

  @Post('exports/:id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async restoreExport(@Param('id') id: string, @Request() req) {
    await this.inventoryService.restoreExport(id, req.user.role);
    return { message: 'Đã khôi phục phiếu xuất kho thành công' };
  }

  @Get('batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.CHEF)
  async getAllBatches(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getAllBatches(include);
  }

  @Get('batches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.CHEF)
  async getBatchById(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getBatchById(id, include);
  }

  @Get('ingredient-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.CHEF)
  async getIngredientStock() {
    return this.inventoryService.getIngredientStock();
  }

  @Get('import-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getImportHistory(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.inventoryService.getImportHistory(new Date(startDate), new Date(endDate));
  }

  @Get('export-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getExportHistory(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.inventoryService.getExportHistory(new Date(startDate), new Date(endDate));
  }

  @Get('costs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getInventoryCosts(
    @Query('start') startDate: string,
    @Query('end') endDate: string
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();
    return this.inventoryService.calculateInventoryCosts(start, end);
  }

  @Get('stock-value') 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getStockValue() {
    return this.inventoryService.getStockValue();
  }

  @Get('expiring')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async getExpiringSoon(@Query('days') days?: number) {
    return this.inventoryService.getExpiringSoonItems(days);
  }
}
