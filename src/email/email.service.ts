// src/email/email.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Konfigurasi transporter email
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      // Ganti 'secure: false' (untuk Ethereal/TLS)
      secure: false, // true untuk port 465 (SSL)
      // --- AKHIR PERUBAHAN ---
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  /**
   * Mengirim link verifikasi email.
   * AKAN MENGEMBALIKAN 'previewUrl' JIKA MENGGUNAKAN ETHEREAL.
   */
  async sendVerificationLink(
    email: string,
    token: string,
  ): Promise<string | null> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    // URL yang akan diklik user di frontend
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'Selamat Datang di Verdeon! Verifikasi Email Anda',
      html: `
        <p>Terima kasih telah mendaftar di Verdeon.</p>
        <p>Silakan klik link di bawah ini untuk memverifikasi akun Anda:</p>
        <a href="${verificationUrl}" target="_blank">Verifikasi Akun Saya</a>
        <br>
        <p>Jika Anda tidak bisa mengklik link, salin URL ini:</p>
        <p>${verificationUrl}</p>
      `,
    };

    // Tangkap hasil 'sendMail' ke dalam variabel 'info'
    const info = await this.transporter.sendMail(mailOptions);

    console.log(`Verification email sent to ${email}`);

    // Cek jika host adalah Ethereal
    if (this.configService.get<string>('EMAIL_HOST')?.includes('ethereal')) {
      const previewUrl = nodemailer.getTestMessageUrl(info); // Tipe: string | false
      console.log('Preview URL (Ethereal): ' + previewUrl);

      // PERBAIKAN: Jika 'previewUrl' adalah 'false', kembalikan 'null'.
      return previewUrl ? previewUrl : null;
    }

    return null; // <-- Kembalikan null jika bukan Ethereal
  }
}
