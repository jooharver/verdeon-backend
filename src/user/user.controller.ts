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
import { AuthGuard } from '@nestjs/passport'; // <-- Import-nya ada di sini

/**
 * Controller ini HANYA untuk manajemen data User (CRUD).
 * Semua endpoint di sini wajib login (mengirim token JWT).
 * Registrasi publik ada di AuthController.
 */
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Endpoint POST /user (Membuat user baru)
   * Diamankan: Hanya user yang terautentikasi (misal: admin)
   * yang bisa membuat user baru secara manual via endpoint ini.
   */
  @UseGuards(AuthGuard('jwt')) // <-- Decorator HARUSNYA di sini
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * Endpoint GET /user (Lihat semua user)
   * Diamankan: Harus login (kirim token) untuk mengakses.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * Endpoint GET /user/:id (Lihat detail user)
   * Diamankan: Harus login (kirim token) untuk mengakses.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  /**
   * Endpoint PATCH /user/:id (Update user)
   * Diamankan: Harus login (kirim token) untuk mengakses.
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * Endpoint DELETE /user/:id (Hapus user)
   * Diamankan: Harus login (kirim token) untuk mengakses.
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
