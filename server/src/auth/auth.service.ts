import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginDto } from '../user/dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
    
    const tokens = this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Xác thực và giải mã refreshToken
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET')
      });
      
      // Lấy userId từ payload
      const userId = payload.sub;
      const user = await this.userService.findOne(userId);
      
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access denied');
      }
      
      // Kiểm tra xem refreshToken có khớp với refreshToken đã lưu
      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken
      );
      
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access denied');
      }
      
      // Tạo cặp token mới
      const tokens = this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  
  

  async logout(userId: number) {
    await this.userService.setRefreshToken(userId, '');
    return { message: 'Logged out successfully' };
  }

  private async updateRefreshToken(userId: string,refreshToken: string) {
    if (!refreshToken) {
      await this.userService.setRefreshToken(userId, '');
      return;
    }
    
    
    await this.userService.setRefreshToken(userId, refreshToken);
  }

  private generateTokens(user: any) {
    const payload = { 
      sub: user.id, 
      username: user.username,
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '24h'),
    });
    
    const refreshToken = this.generateRefreshToken(user);
    
    return {
      accessToken,
      refreshToken,
    };
  }
  
  

  private generateRefreshToken(user: any) {
    const payload = { 
      sub: user.id,
      username: user.username
    };
    
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });
  }
  
  
}