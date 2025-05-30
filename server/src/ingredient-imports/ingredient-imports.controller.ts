import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { IngredientImportsService } from './ingredient-imports.service';
import { CreateImportDto } from './dto/create-import.dto';

@Controller('inventory/imports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngredientImportsController {
  constructor(private readonly importsService: IngredientImportsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  findAll(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.importsService.findAll(include);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  findOne(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted?: string
  ) {
    const include = includeDeleted === 'true';
    return this.importsService.findOne(id, include);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  create(@Body() createImportDto: CreateImportDto, @Request() req) {
    return this.importsService.create(req.user.id, createImportDto);
  }
}
