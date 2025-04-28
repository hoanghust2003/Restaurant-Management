import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../enums/user-role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get current user profile - accessible to authenticated users
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  // Update current user profile - accessible to authenticated users
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
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

  // Create a new user - accessible only to admins
  @UseGuards(JwtAuthGuard)
  @Post()
  async createUser(@Request() req, @Body() createUserDto: CreateUserDto) {
    this.checkIsAdmin(req.user);
    return this.usersService.create(createUserDto);
  }

  // Update a user - accessible only to admins
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.checkIsAdmin(req.user);
    return this.usersService.update(id, updateUserDto);
  }

  // Delete a user - accessible only to admins
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Request() req, @Param('id') id: string) {
    this.checkIsAdmin(req.user);
    await this.usersService.remove(id);
    return { message: 'Xóa người dùng thành công' };
  }

  // Helper method to check if user is an admin
  private checkIsAdmin(user: any) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }
  }
}
