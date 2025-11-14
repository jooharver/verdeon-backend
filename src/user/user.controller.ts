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

// --- IMPORT BARU ---
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './enums/role.enum';
// --- AKHIR IMPORT BARU ---

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Endpoint POST /user
   * Sesuai permintaan: Hanya ADMIN
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard) // <-- Terapkan Guard
  @Roles(UserRole.ADMIN) // <-- Tentukan Role
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * Endpoint GET /user (Lihat semua user)
   * Asumsi: Hanya ADMIN
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * Endpoint GET /user/:id (Lihat detail user)
   * Asumsi: ADMIN (bisa lihat semua) atau User ybs (bisa lihat data sendiri)
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BUYER, UserRole.ISSUER, UserRole.AUDITOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  /**
   * Endpoint PATCH /user/:id (Update user)
   * Sesuai permintaan: ADMIN (bisa edit semua) atau User ybs (edit data sendiri)
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BUYER, UserRole.ISSUER, UserRole.AUDITOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * Endpoint DELETE /user/:id (Hapus user)
   * Sesuai permintaan: ADMIN (bisa hapus semua) atau User ybs (hapus data sendiri)
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BUYER, UserRole.ISSUER, UserRole.AUDITOR)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
