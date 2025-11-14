// src/user/dto/update-user.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEnum,
  IsOptional,
  IsBoolean, // <-- IMPORT BARU
} from 'class-validator';
import { UserRole } from '../enums/role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  // --- TAMBAHAN BARU ---
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
  // --- AKHIR TAMBAHAN ---

  // --- 🚀 PERUBAHAN DI SINI 🚀 ---
  // Menambahkan validasi untuk theme saat user update profil
  @IsOptional()
  @IsEnum(['light', 'dark'], {
    message: 'Theme must be either light or dark',
  })
  theme?: string;
  // --- AKHIR PERUBAHAN ---
}
