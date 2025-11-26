// src/project/dto/create-audit.dto.ts

import { IsEnum, IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { VerificationStatus } from '../project.enums'; // <--- IMPORT DARI ENUMS

export class CreateAuditDto {
  @IsNumber()
  @Type(() => Number)
  verified_installed_capacity_kwp: number;

  @IsNumber()
  @Type(() => Number)
  verified_annual_generation_kwh: number;

  @IsNumber()
  @Type(() => Number)
  baseline_emission_factor: number;

  @IsNumber()
  @Type(() => Number)
  expected_carbon_reduction_ton_per_year: number;

  @IsDateString()
  onsite_measurement_date: Date;

  @IsString()
  @IsNotEmpty()
  audit_notes: string;

  @IsEnum(VerificationStatus)
  audit_status: VerificationStatus;
}