import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const { email, password, name } = registerDto;
    const userExists = await this.userRepository.findOne({ where: { email } });

    if (userExists) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: UserRole.CUSTOMER // Mặc định khi đăng ký là CUSTOMER
    });

    await this.userRepository.save(newUser);

    const payload = { 
      email: newUser.email, 
      sub: newUser.id,
      role: newUser.role 
    };
    const accessToken = this.jwtService.sign(payload);
    
    // Loại bỏ password trước khi trả về thông tin người dùng
    const { password: _, ...userWithoutPassword } = newUser;

    return { 
      accessToken,
      user: userWithoutPassword
    };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role 
    };
    const accessToken = this.jwtService.sign(payload);

    // Loại bỏ password trước khi trả về thông tin người dùng
    const { password: _, ...userWithoutPassword } = user;

    return { 
      accessToken,
      user: userWithoutPassword
    };
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    
    // Loại bỏ password trước khi trả về thông tin người dùng
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }
}
