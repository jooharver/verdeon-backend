// src/user/dto/create-user.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  MinLength,
  IsOptional,
  IsBoolean, // <-- IMPORT BARU
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsOptional()
  @IsString()
  verificationToken?: string;

  // --- TAMBAHAN BARU ---
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
  // --- AKHIR TAMBAHAN ---
  // --- TAMBAHAN BARU UNTUK FIX ERROR ---
  // Dibuat opsional karena register lokal tidak mengirim avatarUrl
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string;
  // --- AKHIR TAMBAHAN ---
}
