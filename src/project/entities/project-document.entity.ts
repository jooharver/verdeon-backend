// project/entities/project-document.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';

export enum DocumentType {
  IMAGE = 'image',          // Foto Proyek
  DOCUMENT = 'document',    // PDF Legalitas/Proposal
  AUDIT_REPORT = 'audit_report', // Laporan Auditor (Nanti)
}

@Entity('project_documents')
export class ProjectDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, (project) => project.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column('uuid')
  project_id: string;

  // Menyimpan peran pengupload (issuer / auditor)
  @Column()
  uploader_role: string; 

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  // Nama file asli (untuk display di frontend)
  // Contoh: "Sertifikat Tanah.pdf"
  @Column()
  original_filename: string;

  // Path file di server (nama unik)
  // Contoh: "uploads/projects/17123456-uuid-sertifikat-tanah.pdf"
  @Column()
  file_path: string;

  @CreateDateColumn()
  uploaded_at: Date;
}