import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private fileUploadService?: FileUploadService, // Optional to prevent breaking changes
  ) {}

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }
    
    // Remove password from returned object
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với email: ${email}`);
    }
    
    return user;
  }

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find();
    
    // Remove password from all users
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  async create(userData: CreateUserDto): Promise<Partial<User>> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user
    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword
    });
    
    await this.userRepository.save(newUser);
    
    // Remove password from returned object
    const { password, ...result } = newUser;
    return result;
  }

  async update(id: string, userData: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.findById(id);
    
    // Check if trying to change email to an already used one
    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({ 
        where: { email: userData.email } 
      });
      
      if (existingUser) {
        throw new BadRequestException('Email đã được sử dụng');
      }
    }

    // If changing avatar and we have the fileUploadService
    if (userData.avatar_url && 
        this.fileUploadService && 
        user.avatar_url && 
        !userData.avatar_url.includes(user.avatar_url)) {
      // Try to delete the old avatar from S3
      try {
        const oldAvatarKey = this.fileUploadService.extractKeyFromUrl(user.avatar_url);
        if (oldAvatarKey) {
          await this.fileUploadService.deleteFile(oldAvatarKey);
        }
      } catch (error) {
        // Log error but continue with update
        console.error('Error deleting old avatar:', error);
      }
    }
    
    // Apply updates
    const updatedUser = await this.userRepository.save({
      id,
      ...user,
      ...userData
    });
    
    // Remove password from returned object
    const { password, ...result } = updatedUser;
    return result;
  }

  async updateProfile(id: string, profileData: UpdateUserProfileDto): Promise<Partial<User>> {
    const user = await this.findById(id);
    
    // Check if trying to change email to an already used one
    if (profileData.email && profileData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({ 
        where: { email: profileData.email }
      });
      
      if (existingUser) {
        throw new BadRequestException('Email đã được sử dụng');
      }
    }

    // If changing avatar and we have the fileUploadService
    if (profileData.avatar_url && 
        this.fileUploadService && 
        user.avatar_url && 
        !profileData.avatar_url.includes(user.avatar_url)) {
      // Try to delete the old avatar from S3
      try {
        const oldAvatarKey = this.fileUploadService.extractKeyFromUrl(user.avatar_url);
        if (oldAvatarKey) {
          await this.fileUploadService.deleteFile(oldAvatarKey);
        }
      } catch (error) {
        // Log error but continue with update
        console.error('Error deleting old avatar:', error);
      }
    }
    
    // Apply updates
    const updatedUser = await this.userRepository.save({
      id,
      ...user,
      ...profileData
    });
    
    // Remove password from returned object
    const { password, ...result } = updatedUser;
    return result;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    // Hash new password
    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Đổi mật khẩu thành công' };
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }

    // If user has an avatar and we have the fileUploadService
    if (user.avatar_url && this.fileUploadService) {
      try {
        const avatarKey = this.fileUploadService.extractKeyFromUrl(user.avatar_url);
        if (avatarKey) {
          await this.fileUploadService.deleteFile(avatarKey);
        }
      } catch (error) {
        // Log error but continue with deletion
        console.error('Error deleting avatar during user removal:', error);
      }
    }
    
    await this.userRepository.remove(user);
  }
}
