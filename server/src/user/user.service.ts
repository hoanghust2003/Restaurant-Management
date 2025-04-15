import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash mật khẩu trước khi lưu vào DB
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Tạo user mới với mật khẩu đã hash
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Lưu user vào DB
    const savedUser = await this.userRepository.save(user);
    
    // Loại bỏ mật khẩu trước khi trả về
    const { password, ...result } = savedUser;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    // Loại bỏ mật khẩu và refresh token trước khi trả về
    return users.map(user => {
      const { password, refreshToken, ...result } = user;
      return result as User;
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Nếu có cập nhật mật khẩu, hash mật khẩu mới
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Nếu cập nhật email, kiểm tra email mới đã tồn tại chưa
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const userWithEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException(`Email ${updateUserDto.email} is already in use`);
      }
    }

    // Cập nhật thông tin người dùng
    Object.assign(user, updateUserDto);
    
    // Lưu thông tin đã cập nhật
    const updatedUser = await this.userRepository.save(user);
    
    // Loại bỏ mật khẩu trước khi trả về
    const { password, refreshToken, ...result } = updatedUser;
    return result as User;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async setRefreshToken(userId: number, refreshToken: string): Promise<void> {
    let hashedRefreshToken: string | undefined;
    
    if (refreshToken) {
      // Hash refresh token trước khi lưu
      hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    }
    
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }
}