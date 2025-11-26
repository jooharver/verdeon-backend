// src/project/entities/project.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ProjectSolarIssuerDetail } from './project-solar-issuer-detail.entity';
import { ProjectSolarAuditorDetail } from './project-solar-auditor-detail.entity';
import { ProjectDocument } from './project-document.entity';

// --- IMPORT DARI FILE ENUMS (BARU) ---
import { ProjectStatus, VerificationStatus, ProjectType } from '../project.enums';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ... (Kode lain tidak berubah) ...

  @Column({ unique: true })
  project_code: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, (user) => user.issuedProjects)
  @JoinColumn({ name: 'issuer_id' })
  issuer: User;

  @Column({ type: 'int' })
  issuer_id: number;

  @ManyToOne(() => User, (user) => user.auditedProjects, { nullable: true })
  @JoinColumn({ name: 'auditor_id' })
  auditor: User;

  @Column({ type: 'int', nullable: true })
  auditor_id: number;

  @Column()
  location_country: string;

  @Column()
  location_province: string;

  @Column()
  location_city: string;

  @Column('text')
  address: string;

  // GUNAKAN IMPORT
  @Column({ type: 'enum', enum: ProjectType, default: ProjectType.SOLAR })
  project_type: ProjectType;

  // GUNAKAN IMPORT
  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  // GUNAKAN IMPORT
  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  admin_verification_status: VerificationStatus;

  @Column({ type: 'text', nullable: true })
  admin_notes: string | null; 

  // GUNAKAN IMPORT
  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  auditor_verification_status: VerificationStatus;

  @OneToOne(() => ProjectSolarIssuerDetail, (detail) => detail.project)
  issuerDetail: ProjectSolarIssuerDetail;

  @OneToOne(() => ProjectSolarAuditorDetail, (detail) => detail.project)
  auditorDetail: ProjectSolarAuditorDetail;

  @OneToMany(() => ProjectDocument, (doc) => doc.project)
  documents: ProjectDocument[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}