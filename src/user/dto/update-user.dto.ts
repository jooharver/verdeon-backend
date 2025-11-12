// src/user/dto/update-user.dto.ts

// Kita asumsikan kamu menggunakan @nestjs/mapped-types
// Jika tidak, buat DTO ini secara manual
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator'; // <-- IMPORT BARU
import { UserRole } from '../enums/role.enum'; // <-- IMPORT BARU

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Field 'name', 'email', 'password' sudah di-inherit
  // dan bersifat opsional dari PartialType

  // --- TAMBAHAN BARU ---
  @IsOptional()
  @IsEnum(UserRole) // <-- Validasi bahwa nilainya harus ada di Enum
  role?: UserRole;
  // --- AKHIR TAMBAHAN ---
}
