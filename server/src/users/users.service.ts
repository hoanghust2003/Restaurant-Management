import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với email: ${email}`);
    }
    
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(userData: Partial<User>): Promise<User> {
    // Hash mật khẩu trước khi lưu
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    
    // Hash mật khẩu nếu được cung cấp
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }
}
