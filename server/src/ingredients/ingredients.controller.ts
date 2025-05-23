import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto, UpdateIngredientDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';
import { FileUploadService } from '../file-upload/file-upload.service';

@Controller('ingredients')
export class IngredientsController {
  constructor(
    private readonly ingredientsService: IngredientsService,
    private readonly fileUploadService: FileUploadService
  ) {}
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
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @UseInterceptors(FileInterceptor('image'))
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
  async remove(@Param('id') id: string, @Request() req) {
    await this.ingredientsService.remove(id, req.user.role);
    return { message: 'Đã xóa nguyên liệu thành công' };
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  async restore(@Param('id') id: string, @Request() req) {
    await this.ingredientsService.restore(id, req.user.role);
    return { message: 'Đã khôi phục nguyên liệu thành công' };
  }
}
