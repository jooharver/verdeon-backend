// src/user/user.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './enums/role.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    const adminCreateDto = {
      ...createUserDto,
      isVerified: true,

      // --- 🚀 PERBAIKAN DI SINI 🚀 ---
      // (Untuk memperbaiki Error 2)
      // Ganti 'null' menjadi 'undefined' agar cocok dengan tipe DTO
      verificationToken: undefined,
      // --- AKHIR PERBAIKAN ---

      // (Error 1 sudah diperbaiki oleh DTO di atas)
      role: createUserDto.role || UserRole.BUYER,
    };

    return this.userService.create(adminCreateDto);
  }

  // ... (Endpoint findAll, findOne, update, remove tidak berubah) ...

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll();
  }
    // --- ENDPOINT BARU: Get List Auditor ---
  // Hanya Admin yang boleh lihat list auditor
  @Get('auditors')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAuditors() {
    return this.userService.findAllAuditors();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BUYER, UserRole.ISSUER, UserRole.AUDITOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BUYER, UserRole.ISSUER, UserRole.AUDITOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BUYER, UserRole.ISSUER, UserRole.AUDITOR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

}
