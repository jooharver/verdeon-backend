// src/auth/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // <--- TAMBAH: Import ConfigService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService, // <--- TAMBAH: Injeksi ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // AMBIL SECRET DARI .ENV, SAMA SEPERTI DI AUTH.MODULE
      secretOrKey: configService.get<string>('JWT_SECRET')!, // <--- UBAH INI
    });
  }

  // Fungsi ini dipanggil jika token valid
  async validate(payload: any) {
    // Data 'payload' ini akan otomatis ditambahkan ke 'request.user'
    // 'sub' adalah 'subject', yang kita isi dengan user.id
    return { userId: payload.sub, email: payload.email, role: payload.role }; // <--- (Opsional) Tambahkan 'role' jika ada di payload
  }
}
