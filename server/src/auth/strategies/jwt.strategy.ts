import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  
  constructor(private configService: ConfigService) {
    // Đảm bảo có một secret key trong mọi trường hợp
    const jwtSecret = configService.get<string>('JWT_SECRET');
    const defaultSecret = 'restaurant_management_secure_jwt_secret_key_2025';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret || defaultSecret,
    });
    
    if (!jwtSecret) {
      this.logger.warn('JWT_SECRET không tìm thấy trong biến môi trường, sử dụng secret mặc định (không an toàn cho môi trường production)');
    }
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
