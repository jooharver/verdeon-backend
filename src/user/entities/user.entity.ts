// src/user/entities/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany, //
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/role.enum';
import { Project } from '../../project/entities/project.entity'; // <-- IMPORT BARU

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BUYER,
  })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  verificationToken: string | null;

  // Ini kodemu, sudah benar
  @Column({
    type: 'varchar',
    nullable: true,
  })
  avatarUrl: string | null;

  // Ini kodemu, sudah benar
  @Column({
    type: 'enum',
    enum: ['light', 'dark'],
    default: 'light',
  })
  theme: string;

  // --- 🚀 TAMBAHAN RELASI YANG WAJIB ADA 🚀 ---
  // (Ini yang akan memperbaiki error 'unknown' dan 'property does not exist')
  
  @OneToMany(() => Project, (project) => project.issuer)
  issuedProjects: Project[];

  @OneToMany(() => Project, (project) => project.auditor)
  auditedProjects: Project[];
  // --- AKHIR TAMBAHAN ---
}