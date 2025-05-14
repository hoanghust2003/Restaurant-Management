import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../enums/user-role.enum';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the required roles from the route handler
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    
    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token not found');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Get JWT secret from config
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const defaultSecret = 'restaurant_management_secure_jwt_secret_key_2025';
      const secret = jwtSecret || defaultSecret;
      
      // Verify and decode token
      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      // Add user data to request object
      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role
      };
      
      // Check if user role is in the required roles
      const hasPermission = requiredRoles.includes(payload.role as UserRole);
      
      if (!hasPermission) {
        this.logger.warn(`User ${payload.email} with role ${payload.role} attempted to access resource requiring roles: ${requiredRoles.join(', ')}`);
        throw new ForbiddenException('You do not have permission to access this resource');
      }
      
      return hasPermission;
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      this.logger.error(`Token verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
