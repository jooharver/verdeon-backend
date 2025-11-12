// src/user/user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Inisialisasi hashedPassword sebagai 'undefined'
    // Tipe ini cocok dengan 'password?: string' di DTO.
    let hashedPassword: string | undefined = undefined;

    // Hanya hash password JIKA disediakan (untuk login lokal)
    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }

    // Buat entitas user baru
    const newUser = this.userRepository.create({
      ...createUserDto, // Ini akan ambil 'name' dan 'email'
      // Ini sekarang 'string' atau 'undefined', yang akan
      // ditangani TypeORM sebagai 'string' atau 'NULL' di DB.
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const userToUpdate = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      userToUpdate.password = hashedPassword;
    }

    return this.userRepository.save(userToUpdate);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    // Fungsi findOne dari TypeORM mengembalikan User atau null
    return this.userRepository.findOne({ where: { email } });
  }
}
