// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy'; // <--- TAMBAH: Import Google Strategy
import { ConfigModule, ConfigService } from '@nestjs/config'; // <--- TAMBAH: Import Config

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule, // <--- TAMBAH: Pastikan ConfigModule ada
    // UBAH: Gunakan 'registerAsync' agar bisa baca .env
    JwtModule.registerAsync({
      imports: [ConfigModule], // <--- Impor ConfigModule
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // <--- Ambil dari .env
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService], // <--- Inject ConfigService
    }),
  ],
  controllers: [AuthController],
  // TAMBAH: Daftarkan GoogleStrategy
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}