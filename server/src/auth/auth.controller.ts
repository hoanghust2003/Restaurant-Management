import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../user/dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh')
  async refreshTokens(@Body() body: { userId: number; refreshToken: string }) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }
}