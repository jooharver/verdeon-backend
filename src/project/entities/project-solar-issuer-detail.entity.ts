// src/project/entities/project-solar-issuer-detail.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';

// Enum untuk tipe instalasi
export enum InstallationType {
  ROOFTOP = 'rooftop',
  GROUND_MOUNTED = 'ground-mounted',
}

@Entity('project_solar_issuer_details')
export class ProjectSolarIssuerDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relasi ke Project (Induk)
  @OneToOne(() => Project, (project) => project.issuerDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column('uuid')
  project_id: string;

  // --- 8 FIELD BARU (TANPA LAT/LONG) ---
  @Column()
  panel_brand: string;

  @Column('float')
  panel_capacity_wp: number;

  @Column('int')
  number_of_panels: number;

  @Column()
  inverter_brand: string;

  @Column('float')
  inverter_capacity_kw: number;

  @Column({
    type: 'enum',
    enum: InstallationType,
  })
  installation_type: InstallationType;

  @Column('float')
  area_size_m2: number;

  @Column('date')
  installation_date: Date;

  @Column({ nullable: true })
  documentation_url: string;

  // HAPUS: latitude dan longitude
  // --- AKHIR 8 FIELD ---

  @CreateDateColumn()
  submitted_at: Date;

  @UpdateDateColumn()
  last_updated_at: Date;
}