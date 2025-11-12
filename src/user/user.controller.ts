import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards, // <-- Import UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport'; // <-- Import AuthGuard

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Endpoint POST /user (Registrasi)
  // TIDAK perlu diamankan, agar user baru bisa mendaftar
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Endpoint GET /user (Lihat semua user)
  // Harus login (kirim token) untuk mengakses
  @UseGuards(AuthGuard('jwt')) // <-- Diamankan
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Endpoint GET /user/:id (Lihat detail user)
  // Harus login (kirim token) untuk mengakses
  @UseGuards(AuthGuard('jwt')) // <-- Diamankan
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // Endpoint PATCH /user/:id (Update user)
  // Harus login (kirim token) untuk mengakses
  @UseGuards(AuthGuard('jwt')) // <-- Diamankan
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // Endpoint DELETE /user/:id (Hapus user)
  // Harus login (kirim token) untuk mengakses
  @UseGuards(AuthGuard('jwt')) // <-- Diamankan
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
