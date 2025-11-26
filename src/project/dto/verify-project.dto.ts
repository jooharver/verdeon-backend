// src/project/dto/verify-project.dto.ts

import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer'; // <--- PASTIKAN IMPORT INI ADA
import { VerificationStatus } from '../project.enums';

export class VerifyProjectDto {
  @IsEnum(VerificationStatus)
  @IsNotEmpty()
  status: VerificationStatus; 

  @IsInt()
  @IsOptional()
  @Type(() => Number) // <--- KOREKSI: Tambahkan Type Conversion ini!
  auditor_id?: number; 

  @IsString()
  @IsOptional()
  admin_notes?: string;
}