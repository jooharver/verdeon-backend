// src/project/entities/project-solar-auditor-detail.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { Project } from './project.entity'; 

// --- UBAH IMPORT DI SINI ---
// Ambil VerificationStatus dari file enum, bukan dari entity project
import { VerificationStatus } from '../project.enums'; 

@Entity('project_solar_auditor_details')
export class ProjectSolarAuditorDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Project, (project) => project.auditorDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column('uuid')
  project_id: string;

  // ... (Field lain sama, tidak perlu diubah) ...
  @Column('float')
  verified_installed_capacity_kwp: number;

  @Column('float')
  verified_annual_generation_kwh: number;

  @Column('float')
  baseline_emission_factor: number;

  @Column('float')
  expected_carbon_reduction_ton_per_year: number;

  @Column('date')
  onsite_measurement_date: Date;

  @Column('text')
  audit_notes: string;

  @Column()
  auditor_documentation_url: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING // Error undefined akan hilang karena file enum terpisah
  })
  audit_status: VerificationStatus;

  @CreateDateColumn()
  verified_at: Date;
}