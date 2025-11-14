// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  /**
   * Registrasi Lokal (Tidak Berubah)
   */
  async register(createUserDto: CreateUserDto) {
    // 1. Cek email
    const existingUser = await this.userService.findByEmail(createUserDto.email);

    // 2. Jika user ada DAN sudah terverifikasi, lempar error
    if (existingUser && existingUser.isVerified) {
      throw new UnauthorizedException('Email already in use');
    }

    // 3. Buat token verifikasi
    const verificationToken = crypto.randomBytes(32).toString('hex');

    let userToSave: User;

    if (existingUser && !existingUser.isVerified) {
      // 4a. Jika user ada tapi BELUM verifikasi (mungkin daftar ulang)
      // Update user tersebut dengan password & token baru
      const hashedPassword = createUserDto.password
        ? await bcrypt.hash(createUserDto.password, 10)
        : undefined;

      userToSave = await this.userService.update(existingUser.id, {
        ...createUserDto,
        password: hashedPassword,
        verificationToken: verificationToken,
        isVerified: false,
      });
    } else {
      // 4b. Jika user benar-benar baru
      userToSave = await this.userService.create({
        ...createUserDto,
        verificationToken: verificationToken,
        isVerified: false,
      });
    }

    // 5. Kirim email DAN TANGKAP PREVIEW URL
    const previewUrl = await this.emailService.sendVerificationLink(
      userToSave.email,
      verificationToken,
    );

    // 6. Siapkan respons
    const response: { message: string; etherealPreviewUrl?: string } = {
      message:
        'Registration successful. Please check your email to verify your account.',
    };

    // 7. Tambahkan URL ke respons jika ada
    if (previewUrl) {
      response.etherealPreviewUrl = previewUrl;
    }

    return response;
  }

  /**
   * Verifikasi Email (Tidak Beruhah)
   */
  async verifyEmail(token: string) {
    // 1. Cari user by token
    const user = await this.userService.findByToken(token);

    if (!user) {
      throw new NotFoundException('Verification token is invalid or has expired.');
    }

    // 2. Update status verifikasi
    user.isVerified = true;
    user.verificationToken = null; // Hapus token
    await this.userService.saveUser(user); // Simpan perubahan

    return { message: 'Email verified successfully. You can now log in.' };
  }

  /**
   * Validasi User (Login Lokal) (Tidak Berubah)
   */
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);

    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      if (!user.isVerified) {
        throw new UnauthorizedException(
          'Please verify your email before logging in.',
        );
      }

      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }

  /**
   * Login Google (Diperbarui dari respons saya sebelumnya)
   * Menyimpan/Memperbarui name dan avatarUrl
   */
  async googleLogin(googleUser: {
    email: string;
    name: string;
    avatarUrl: string; // Sesuai dengan google.strategy.ts
  }) {
    if (!googleUser) {
      throw new UnauthorizedException('No user data from Google');
    }

    let user = await this.userService.findByEmail(googleUser.email);

    if (user) {
      // --- JIKA USER SUDAH ADA ---
      // Update nama & avatar mereka ke info Google terbaru
      // dan pastikan mereka terverifikasi
      user.name = googleUser.name;
      user.avatarUrl = googleUser.avatarUrl;
      user.isVerified = true; // Login via Google otomatis memverifikasi
      await this.userService.saveUser(user); // Simpan perubahan
    } else {
      // --- JIKA USER BARU ---
      // Buat user baru dengan data lengkap dari Google
      // Method create() Anda sudah bisa menangani ini
      user = await this.userService.create({
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.avatarUrl, // <-- Menyimpan avatarUrl
        isVerified: true, // Langsung set 'true'
      });
    }

    return this.login(user);
  }

  /**
   * Login (Internal) (Tidak Berubah)
   */
  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Get Profile (Diperbarui)
   * Dipanggil oleh endpoint /auth/me
   */
  async getProfile(userId: number) {
    // --- PERBAIKAN ---
    // Menggunakan method 'findOne' dari UserService Anda, bukan 'findById'
    const user = await this.userService.findOne(userId);
    // --- AKHIR PERBAIKAN ---

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    // Hapus properti sensitif sebelum dikirim ke frontend
    const { password, verificationToken, ...profile } = user;

    return profile; // Mengembalikan { id, email, name, role, isVerified, avatarUrl }
  }
}
