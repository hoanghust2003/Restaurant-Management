import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Đảm bảo sử dụng cùng một JWT_SECRET với JwtStrategy
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const defaultSecret = 'restaurant_management_secure_jwt_secret_key_2025';
      const secret = jwtSecret || defaultSecret;
      
      const payload = this.jwtService.verify(token, { secret });
      
      // Transform the JWT payload to match the expected structure
      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role
      };
      
      return true;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
