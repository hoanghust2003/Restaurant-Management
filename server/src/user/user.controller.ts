import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Chỉ admin hoặc manager mới có thể tạo người dùng mới
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MANAGER) {
      throw new Error('Forbidden: Insufficient permissions');
    }
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req) {
    // Chỉ admin hoặc manager mới có thể xem tất cả người dùng
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MANAGER) {
      throw new Error('Forbidden: Insufficient permissions');
    }
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Người dùng chỉ có thể xem thông tin của chính họ hoặc admin/manager có thể xem của tất cả
    if (req.user.userId !== id && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MANAGER) {
      throw new Error('Forbidden: Insufficient permissions');
    }
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    // Người dùng chỉ có thể cập nhật thông tin của chính họ hoặc admin/manager có thể cập nhật của tất cả
    // Chỉ admin mới có thể thay đổi vai trò (role)
    if (req.user.userId !== id && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MANAGER) {
      throw new Error('Forbidden: Insufficient permissions');
    }
    
    if (updateUserDto.role && req.user.role !== UserRole.ADMIN) {
      throw new Error('Forbidden: Only admins can change user roles');
    }
    
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Chỉ admin hoặc manager mới có thể xóa người dùng
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MANAGER) {
      throw new Error('Forbidden: Insufficient permissions');
    }
    return this.userService.remove(id);
  }
}