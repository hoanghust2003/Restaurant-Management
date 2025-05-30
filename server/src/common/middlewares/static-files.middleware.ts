import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Middleware to handle CORS headers for static files
 * Allows specified domains to access static files such as images
 */
@Injectable()
export class StaticFilesMiddleware implements NestMiddleware {
  private allowedOrigins: string[] = [];

  constructor(private configService: ConfigService) {
    // Get allowed origins from environment variable (comma separated list)
    const allowedOriginsStr = this.configService.get<string>('ALLOWED_ORIGINS');
    
    if (allowedOriginsStr) {
      this.allowedOrigins = allowedOriginsStr.split(',').map(origin => origin.trim());
    }
    
    // Always include localhost for development
    if (!this.allowedOrigins.includes('http://localhost:3000')) {
      this.allowedOrigins.push('http://localhost:3000');
    }
    if (!this.allowedOrigins.includes('http://localhost:4200')) {
      this.allowedOrigins.push('http://localhost:4200');
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Only apply CORS headers to requests for static files in the uploads directory
    if (req.path.startsWith('/uploads/')) {
      const origin = req.headers.origin;
      
      // Check if the origin is allowed or if we should allow all origins
      if (origin && (this.allowedOrigins.includes(origin) || this.allowedOrigins.includes('*'))) {
        res.header('Access-Control-Allow-Origin', origin);
      } else if (this.allowedOrigins.includes('*')) {
        res.header('Access-Control-Allow-Origin', '*');
      }
      
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
    }
    
    next();
  }
}