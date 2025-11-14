// src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Ambil role apa saja yang DIPERLUKAN dari decorator @Roles
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Jika endpoint tidak punya @Roles(...), anggap publik (lolos)
    if (!requiredRoles) {
      return true;
    }

    // 2. Ambil data user dari request (yang sudah diisi oleh JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Jika tidak ada data user (misal lupa pasang JwtAuthGuard)
    if (!user || !user.role) {
      return false;
    }

    // 3. LOGIKA INTI:
    // Cek apakah user adalah ADMIN
    if (requiredRoles.includes(UserRole.ADMIN) && user.role === UserRole.ADMIN) {
      // Jika endpoint mengizinkan ADMIN, dan user adalah ADMIN, lolos.
      return true;
    }

    // 4. LOGIKA "DIRI SENDIRI" (untuk non-admin)
    
    // Cek dulu apakah role user (misal 'buyer') ada di daftar @Roles
    const userRoleAllowed = requiredRoles.includes(user.role);
    if (!userRoleAllowed) {
      // Jika rolenya (misal 'buyer') tidak ada di @Roles(UserRole.ADMIN),
      // langsung tolak.
      return false;
    }

    // Jika rolenya diizinkan (misal 'buyer' ada di @Roles(..., UserRole.BUYER))
    // KITA HARUS CEK ID
    
    const paramsId = request.params.id;
    if (paramsId) {
      // Jika ada param :id di URL, bandingkan dengan ID user di token
      // (Ubah 'paramsId' ke angka, karena 'userId' adalah angka)
      return Number(paramsId) === user.userId;
    }

    // Jika rolenya non-admin, diizinkan, tapi tidak ada params.id
    // (misal 'buyer' mencoba akses GET /user), tolak.
    return false;
  }
}
