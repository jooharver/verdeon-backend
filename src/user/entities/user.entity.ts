// src/user/entities/user.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/role.enum';

@Entity()
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

  // --- TAMBAHAN BARU ---
  // Kolom ini akan menyimpan URL gambar avatar dari Google
  @Column({
    type: 'varchar', // varchar cukup untuk URL
    nullable: true,
  })
  avatarUrl: string | null;
  // --- AKHIR TAMBAHAN ---

  // --- 🚀 PERUBAHAN DI SINI 🚀 ---
  // Menambahkan kolom theme sesuai permintaan
  @Column({
    type: 'enum',
    enum: ['light', 'dark'], // Hanya 2 nilai ini yang diizinkan
    default: 'light',
  })
  theme: string;
  // --- AKHIR PERUBAHAN ---
}
