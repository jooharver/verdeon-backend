// src/user/dto/create-user.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  IsEnum, // <-- IMPORT BARU
} from 'class-validator';
import { UserRole } from '../enums/role.enum'; // <-- IMPORT BARU

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

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  // --- 🚀 TAMBAHAN BARU 🚀 ---
  // (Untuk memperbaiki Error 1)
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
  // --- AKHIR TAMBAHAN ---

  // ... (properti 'avatarUrl' dan 'theme' mungkin ada di sini juga)
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @IsOptional()
  @IsEnum(['light', 'dark'])
  theme?: string;
}