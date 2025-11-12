// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Secret key harus SAMA PERSIS dengan di auth.module.ts
      secretOrKey: 'INI_SECRET_KEY_SANGAT_RAHASIA_12345',
    });
  }

  // Fungsi ini dipanggil jika token valid
  // Payload adalah data yang kita masukkan ke token (lihat auth.service)
  async validate(payload: any) {
    // Data 'payload' ini akan otomatis ditambahkan ke 'request.user'
    return { userId: payload.sub, email: payload.email };
  }
}