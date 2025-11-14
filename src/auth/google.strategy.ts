// src/auth/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  // Fungsi ini dipanggil setelah Google berhasil mengotentikasi user
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    // --- MODIFIKASI DISINI ---
    // Merakit nama lengkap dengan lebih aman, menangani jika familyName tidak ada
    const fullName = name.givenName
      ? `${name.givenName} ${name.familyName || ''}`.trim()
      : profile.displayName;

    // Membuat payload user yang akan dikirim ke req.user
    const userPayload = {
      email: emails[0].value,
      name: fullName,
      avatarUrl: photos[0].value, // Menggunakan 'avatarUrl' agar konsisten
      accessToken, // (Opsional, tapi bisa berguna)
    };
    // --- AKHIR MODIFIKASI ---

    // Mengirim payload ini ke req.user di Google AuthGuard
    done(null, userPayload);
  }
}
