// src/auth/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // --- UBAH FUNGSI INI ---
  async validate(payload: any) {
    // 'payload' adalah isi dari JWT (dibuat di auth.service.ts)
    // Pastikan 'login' di AuthService menyertakan 'sub' dan 'role'
    return {
      userId: payload.sub, // <-- 'sub' adalah ID user
      email: payload.email,
      role: payload.role, // <-- Tambahkan role
    };
  }
  // --- AKHIR PERUBAHAN ---
}
