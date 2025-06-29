import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto, UpdateIngredientDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';
import { FileUploadService } from '../file-upload/file-upload.service';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(
    private readonly ingredientsService: IngredientsService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get ingredients with low stock' })
  @ApiResponse({ status: 200, description: 'Returns list of ingredients below threshold' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getLowStock() {
    return this.ingredientsService.getLowStock();
  }

  @Get()
  @ApiOperation({ summary: 'Get all ingredients' })
  @ApiQuery({ name: 'includeDeleted', type: 'string', required: false, description: 'Include deleted ingredients (true/false)' })
  @ApiResponse({ status: 200, description: 'Returns list of all ingredients with current stock' })
  async findAll(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.ingredientsService.findAll(include);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ingredient by ID' })
  @ApiParam({ name: 'id', description: 'Ingredient ID', type: 'string' })
  @ApiQuery({ name: 'includeDeleted', type: 'string', required: false, description: 'Include deleted ingredients (true/false)' })
  @ApiResponse({ status: 200, description: 'Returns ingredient details with current stock' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async findOne(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.ingredientsService.findOne(id, include);
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new ingredient' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Ingredient created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiBody({
    description: 'Ingredient data with optional image',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Thịt bò' },
        unit: { type: 'string', example: 'kg' },
        threshold: { type: 'number', example: 10 },
        description: { type: 'string', example: 'Thịt bò tươi' },
        image: { type: 'string', format: 'binary' }
      },
      required: ['name', 'unit', 'threshold']
    }
  })
  async create(
    @Body() createIngredientDto: CreateIngredientDto, 
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
        fileIsRequired: false,
      }),
    ) image: Express.Multer.File,
  ) {
    let ingredientData = { ...createIngredientDto };
    
    // Upload image if provided
    if (image) {
      const imageUrl = await this.fileUploadService.uploadFile(image, 'ingredients');
      if (imageUrl) {
        ingredientData.image_url = imageUrl;
      }
    }
    
    return this.ingredientsService.create(ingredientData, req.user.role);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update ingredient' })
  @ApiParam({ name: 'id', description: 'Ingredient ID', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Ingredient updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  @ApiBody({
    description: 'Updated ingredient data with optional image',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Thịt bò' },
        unit: { type: 'string', example: 'kg' },
        threshold: { type: 'number', example: 10 },
        description: { type: 'string', example: 'Thịt bò tươi' },
        image: { type: 'string', format: 'binary' }
      }
    }
  })
  async update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
        fileIsRequired: false,
      }),
    ) image: Express.Multer.File,
  ) {
    let ingredientData = { ...updateIngredientDto };
    
    // Upload image if provided
    if (image) {
      const imageUrl = await this.fileUploadService.uploadFile(image, 'ingredients');
      if (imageUrl) {
        ingredientData.image_url = imageUrl;
      }
    }
    
    return this.ingredientsService.update(id, ingredientData, req.user.role);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete ingredient (soft delete)' })
  @ApiParam({ name: 'id', description: 'Ingredient ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Ingredient deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.ingredientsService.remove(id, req.user.role);
    return { message: 'Đã xóa nguyên liệu thành công' };
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore deleted ingredient' })
  @ApiParam({ name: 'id', description: 'Ingredient ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Ingredient restored successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async restore(@Param('id') id: string, @Request() req) {
    await this.ingredientsService.restore(id, req.user.role);
    return { message: 'Đã khôi phục nguyên liệu thành công' };
  }
}
