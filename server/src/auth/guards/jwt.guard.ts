import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

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
    let token: string | undefined;

    if (context.getType() === 'ws') {
      // Handle WebSocket connections
      const client = context.switchToWs().getClient();
      token = client.handshake?.auth?.token;
    } else {
      // Handle HTTP requests
      const req = context.switchToHttp().getRequest<Request>();
      token = req.headers['authorization']?.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Ensure we use the same JWT_SECRET as JwtStrategy
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const defaultSecret = 'restaurant_management_secure_jwt_secret_key_2025';
      const secret = jwtSecret || defaultSecret;
      
      const payload = this.jwtService.verify(token, { secret });
      
      if (context.getType() === 'http') {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        // Transform the JWT payload to match the expected structure
        req.user = {
          userId: payload.sub,
          email: payload.email,
          role: payload.role
        };
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
