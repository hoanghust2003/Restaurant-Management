import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { FileUploadService } from '../file-upload/file-upload.service';

@Controller('menus')
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Get()
  async findAll(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.menusService.findAll(include);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.menusService.findOne(id, include);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CHEF)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createMenuDto: CreateMenuDto, 
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
    let menuData = { ...createMenuDto };
    
    // Upload image if provided
    if (image) {
      const imageUrl = await this.fileUploadService.uploadFile(image, 'menus');
      if (imageUrl) {
        menuData.image_url = imageUrl;
      }
    }
    
    return this.menusService.create(menuData, req.user.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CHEF)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string, 
    @Body() updateMenuDto: UpdateMenuDto, 
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
    let menuData = { ...updateMenuDto };
    
    // Upload image if provided
    if (image) {
      const imageUrl = await this.fileUploadService.uploadFile(image, 'menus');
      if (imageUrl) {
        menuData.image_url = imageUrl;
      }
    }
    
    return this.menusService.update(id, menuData, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CHEF)
  async remove(@Param('id') id: string, @Request() req) {
    await this.menusService.remove(id, req.user.role);
    return { message: 'Đã xóa thực đơn thành công' };
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CHEF)
  async restore(@Param('id') id: string, @Request() req) {
    await this.menusService.restore(id, req.user.role);
    return { message: 'Đã khôi phục thực đơn thành công' };
  }

  @Get(':id/dishes')
  async getDishes(@Param('id') id: string) {
    return this.menusService.getDishes(id);
  }

  @Post(':id/dishes/:dishId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CHEF)
  async addDishToMenu(
    @Param('id') id: string,
    @Param('dishId') dishId: string,
    @Request() req
  ) {
    return this.menusService.addDishToMenu(id, dishId, req.user.role);
  }

  @Delete(':id/dishes/:dishId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CHEF)
  async removeDishFromMenu(
    @Param('id') id: string,
    @Param('dishId') dishId: string,
    @Request() req
  ) {
    await this.menusService.removeDishFromMenu(id, dishId, req.user.role);
    return { message: 'Đã xóa món ăn khỏi thực đơn thành công' };
  }
  @Post(':id/dishes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CHEF)
  async addDishesToMenu(
    @Param('id') id: string,
    @Body() body: { dishIds: string[] },
    @Request() req
  ) {
    const results: any[] = [];
    for (const dishId of body.dishIds) {
      try {
        const result = await this.menusService.addDishToMenu(id, dishId, req.user.role);
        results.push(result);
      } catch (error) {
        // Log error but continue with other dishes
        console.error(`Error adding dish ${dishId} to menu ${id}:`, error);
      }
    }
    return { message: 'Dishes added to menu', count: results.length };
  }

  @Delete(':id/dishes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CHEF)
  async removeDishesFromMenu(
    @Param('id') id: string,
    @Body() body: { dishIds: string[] },
    @Request() req
  ) {
    const results: string[] = [];
    for (const dishId of body.dishIds) {
      try {
        await this.menusService.removeDishFromMenu(id, dishId, req.user.role);
        results.push(dishId);
      } catch (error) {
        // Log error but continue with other dishes
        console.error(`Error removing dish ${dishId} from menu ${id}:`, error);
      }
    }
    return { message: 'Dishes removed from menu', count: results.length };
  }
}
