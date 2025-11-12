// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // --- Untuk Login Lokal ---
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);

    // Pastikan user ada DAN password-nya tidak null (berarti bukan akun Oauth)
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // Hapus password dari objek user sebelum mengembalikannya
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }

  // --- Untuk Login Lokal ---
  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // --- UNTUK LOGIN GOOGLE ---
  async googleLogin(googleUser: { email: string; name: string; picture: string }) {
    if (!googleUser) {
      throw new UnauthorizedException('No user data from Google');
    }

    let user = await this.userService.findByEmail(googleUser.email);

    if (!user) {
      // 2. Jika TIDAK ADA, buat user baru
      user = await this.userService.create({
        email: googleUser.email,
        name: googleUser.name,
        // profilePicture: googleUser.picture, // (Jika kamu punya kolom ini)

        // <-- PERBAIKAN: Hapus baris 'password: null'
        // Karena 'password' sudah opsional ('?') di DTO,
        // tidak mengirimkannya akan membuatnya 'undefined'.
        // 'UserService.create' kita sudah siap menangani 'undefined'.
      });
    }

    // 3. Buat JWT Token
    return this.login(user);
  }
}
