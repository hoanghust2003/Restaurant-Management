import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Delete, Patch } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { CreateImportDto } from './dto/create-import.dto';
import { CreateExportDto } from './dto/create-export.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async getInventoryStats() {
    return this.inventoryService.getInventoryStats();
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE, UserRole.CHEF)
  async getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('expiring-soon')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async getExpiringSoonItems(@Query('days') days: number = 30) {
    return this.inventoryService.getExpiringSoonItems(days);
  }

  @Get('imports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async getAllImports(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getAllImports(include);
  }

  @Get('imports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async getImportById(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getImportById(id, include);
  }

  @Post('imports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async createImport(@Body() createImportDto: CreateImportDto, @Request() req) {
    return this.inventoryService.createImport(createImportDto, req.user.id);
  }

  @Delete('imports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async removeImport(@Param('id') id: string, @Request() req) {
    await this.inventoryService.removeImport(id, req.user.role);
    return { message: 'Đã xóa phiếu nhập kho thành công' };
  }

  @Post('imports/:id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async restoreImport(@Param('id') id: string, @Request() req) {
    await this.inventoryService.restoreImport(id, req.user.role);
    return { message: 'Đã khôi phục phiếu nhập kho thành công' };
  }

  @Get('exports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async getAllExports(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getAllExports(include);
  }

  @Get('exports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async getExportById(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getExportById(id, include);
  }

  @Post('exports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async createExport(@Body() createExportDto: CreateExportDto, @Request() req) {
    return this.inventoryService.createExport(createExportDto, req.user.id);
  }

  @Delete('exports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async removeExport(@Param('id') id: string, @Request() req) {
    await this.inventoryService.removeExport(id, req.user.role);
    return { message: 'Đã xóa phiếu xuất kho thành công' };
  }

  @Post('exports/:id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async restoreExport(@Param('id') id: string, @Request() req) {
    await this.inventoryService.restoreExport(id, req.user.role);
    return { message: 'Đã khôi phục phiếu xuất kho thành công' };
  }

  @Get('batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE, UserRole.CHEF)
  async getAllBatches(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getAllBatches(include);
  }

  @Get('batches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE, UserRole.CHEF)
  async getBatchById(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.inventoryService.getBatchById(id, include);
  }

  @Get('ingredient-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE, UserRole.CHEF)
  async getIngredientStock() {
    return this.inventoryService.getIngredientStock();
  }

  @Get('import-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async getImportHistory(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.inventoryService.getImportHistory(startDate, endDate);
  }

  @Get('export-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async getExportHistory(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.inventoryService.getExportHistory(startDate, endDate);
  }

  @Get('reports/stock-value')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  async getStockValueReport() {
    return this.inventoryService.getStockValueReport();
  }
}
