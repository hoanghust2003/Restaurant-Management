import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadInterceptor } from '../common/interceptors/file-upload.interceptor';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../enums/user-role.enum';
import { FileUploadService } from '../file-upload/file-upload.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService
  ) {}

  // Get current user profile - accessible to authenticated users
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  // Update current user profile with avatar - accessible to authenticated users
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar'), FileUploadInterceptor)
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateUserProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
        fileIsRequired: false,
      }),
    ) avatar: Express.Multer.File,
  ) {
    if (avatar) {
      // Upload avatar to S3 using our enhanced method
      const avatarUrl = await this.fileUploadService.uploadFile(avatar, 'avatars');
      
      // Only add avatar URL if it's not null
      if (avatarUrl) {
        updateProfileDto.avatar_url = avatarUrl;
      }
    }
    
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  // Change current user password - accessible to authenticated users
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  // Admin routes below

  // Get all users - accessible only to admins
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@Request() req) {
    this.checkIsAdmin(req.user);
    return this.usersService.findAll();
  }

  // Create a new user with avatar - accessible only to admins
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('avatar'), FileUploadInterceptor)
  async createUser(
    @Request() req, 
    @Body() createUserDto: CreateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
        fileIsRequired: false,
      }),
    ) avatar: Express.Multer.File,
  ) {
    this.checkIsAdmin(req.user);
    
    let userData: CreateUserDto = { ...createUserDto };
    
    if (avatar) {
      // Upload avatar to S3 using our enhanced method
      const avatarUrl = await this.fileUploadService.uploadFile(avatar, 'avatars');
      
      // Only add avatar URL if it's not null
      if (avatarUrl) {
        userData.avatar_url = avatarUrl;
      }
    }
    
    return this.usersService.create(userData);
  }

  // Update a user with avatar - accessible only to admins
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'), FileUploadInterceptor)
  async updateUser(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), 
        ],
        fileIsRequired: false,
        errorHttpStatusCode: 400,
      }),
    ) avatar: Express.Multer.File,
  ) {
    try {
      // Check admin permission
      this.checkIsAdmin(req.user);
      
      // Prevent admin from editing their own role
      if (id === req.user.userId && updateUserDto.role) {
        throw new ForbiddenException('Không thể thay đổi vai trò của chính mình');
      }
      
      // Handle avatar upload if provided
      if (avatar) {
        const avatarUrl = await this.fileUploadService.uploadFile(avatar, 'avatars');
        if (avatarUrl) {
          updateUserDto.avatar_url = avatarUrl;
        }
      }
      
      const updatedUser = await this.usersService.update(id, updateUserDto);
      return { message: 'Cập nhật người dùng thành công', user: updatedUser };
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi cập nhật người dùng: ${error.message}`);
    }
  }

  // Delete a user - accessible only to admins
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Request() req, @Param('id') id: string) {
    try {
      // Check admin permission
      this.checkIsAdmin(req.user);
      
      // Prevent admin from deleting themselves
      if (id === req.user.userId) {
        throw new ForbiddenException('Không thể xóa tài khoản của chính mình');
      }

      await this.usersService.remove(id);
      return { message: 'Xóa người dùng thành công' };
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi xóa người dùng: ${error.message}`);
    }
  }

  // Helper method to check if user is an admin
  private checkIsAdmin(user: any) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }
  }
}
