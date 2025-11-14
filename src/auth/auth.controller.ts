import {
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
  Res,
  Body,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard'; // Pastikan ini ada

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  /**
   * ENDPOINT REGISTRASI
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  /**
   * ENDPOINT Verifikasi Email
   */
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  /**
   * Login Lokal
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  /**
   * Login Google (Bagian 1: Memulai)
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {
    // Memicu redirect ke Google
  }

  /**
   * Login Google (Bagian 2: Callback)
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const { access_token } = await this.authService.googleLogin(req.user);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    // --- PERBAIKAN DI SINI ---
    // Tambahkan /auth/google/ sebelum 'callback'
    res.redirect(
      `${frontendUrl}/auth/google/callback?token=${access_token}`,
    );
    // --- AKHIR PERBAIKAN ---
  }

// --- INI DIA PERBAIKANNYA ---
  /**
   * ENDPOINT Get My Profile
   */
  @UseGuards(JwtAuthGuard)  
  @Get('me')
  getProfile(@Request() req) {
    // Pastikan Anda menggunakan 'req.user.userId'
    // sesuai dengan apa yang dikirim oleh jwt.strategy.ts
    return this.authService.getProfile(req.user.userId);
  }
  // --- AKHIR PERBAIKAN ---
}
