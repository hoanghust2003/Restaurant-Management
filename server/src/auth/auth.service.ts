import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginDto } from '../user/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByUsername(username);
      
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, refreshToken, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }
    
    return this.generateTokens(user);
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }
    
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }
    
    const tokens = this.generateTokens(user);
    await this.userService.setRefreshToken(user.id, tokens.refreshToken);
    
    return tokens;
  }

  async logout(userId: number) {
    await this.userService.setRefreshToken(userId, '');
    return { message: 'Logged out successfully' };
  }

  private generateTokens(user: any) {
    const payload = { 
      sub: user.id, 
      username: user.username,
      role: user.role 
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.generateRefreshToken(),
    };
  }

  private generateRefreshToken() {
    const randomBytes = require('crypto').randomBytes(64).toString('hex');
    return randomBytes;
  }
}