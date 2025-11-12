// src/user/entities/user.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/role.enum'; // <-- IMPORT BARU

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

  // --- TAMBAHAN BARU ---
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BUYER, // <-- Default 'buyer'
  })
  role: UserRole;
  // --- AKHIR TAMBAHAN ---
}
