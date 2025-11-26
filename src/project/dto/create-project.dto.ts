// src/project/dto/create-project.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectType } from '../project.enums'; // <--- IMPORT DARI ENUMS
import { InstallationType } from '../entities/project-solar-issuer-detail.entity';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  location_country: string;

  @IsString()
  @IsNotEmpty()
  location_province: string;

  @IsString()
  @IsNotEmpty()
  location_city: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(ProjectType)
  @IsOptional()
  project_type: ProjectType = ProjectType.SOLAR;

  // --- FIELD TEKNIS ---

  @IsString()
  @IsNotEmpty()
  panel_brand: string;

  @IsNumber()
  @Type(() => Number)
  panel_capacity_wp: number;

  @IsNumber()
  @Type(() => Number)
  number_of_panels: number;

  @IsString()
  @IsNotEmpty()
  inverter_brand: string;

  @IsNumber()
  @Type(() => Number)
  inverter_capacity_kw: number;

  @IsEnum(InstallationType)
  installation_type: InstallationType;

  @IsNumber()
  @Type(() => Number)
  area_size_m2: number;

  @IsDateString()
  installation_date: Date;

  @IsUrl()
  @IsOptional()
  documentation_url?: string;
}