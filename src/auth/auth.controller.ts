// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Request,
  UseGuards,
  Get, // <--- TAMBAH
  Req, // <--- TAMBAH
  Res, // <--- TAMBAH
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config'; // <--- TAMBAH
import type { Response } from 'express'; // <--- TAMBAH

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService, // <--- TAMBAH: Inject ConfigService
  ) {}

  // --- Login Lokal (Email/Password) ---
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    // req.user didapat dari LocalStrategy.validate()
    return this.authService.login(req.user);
  }

  // --- Login Google (Bagian 1: Memulai) ---
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Endpoint ini akan memicu redirect ke halaman login Google
    // berkat AuthGuard('google')
  }

  // --- Login Google (Bagian 2: Callback) ---
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    // 'req.user' sekarang berisi data dari GoogleStrategy.validate()
    // Kita panggil service untuk 'upsert' user dan generate token
    const { access_token } = await this.authService.googleLogin(req.user);

    // Ambil URL frontend dari .env
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    // Redirect kembali ke frontend, sambil mengirimkan token via query param
    res.redirect(`${frontendUrl}/auth/google/callback?token=${access_token}`);
  }
}