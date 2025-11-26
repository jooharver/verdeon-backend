// src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/enums/role.enum'; // <-- Pastikan path ini benar
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Ambil role apa saja yang DIPERLUKAN
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Tidak ada @Roles, lolos
    }

    // 2. Ambil data user
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false; // Tidak ada user (lupa JwtAuthGuard?)
    }

    // --- 🚀 PERBAIKAN LOGIKA INTI 🚀 ---

    // 3. Cek Super Admin: Admin BISA SEMUANYA
    // (Asumsi role admin-mu adalah UserRole.ADMIN)
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // 4. Cek Role: Apakah role user (misal 'issuer') ada di daftar?
    const userRoleAllowed = requiredRoles.includes(user.role);
    if (!userRoleAllowed) {
      // Misal endpoint butuh @Roles(UserRole.ISSUER)
      // tapi user adalah 'buyer', maka tolak.
      return false;
    }

    // 5. Cek Kepemilikan (jika perlu)
    // Sampai di sini, kita tahu role user SUDAH diizinkan.
    // (Contoh: user 'issuer' mengakses endpoint @Roles(UserRole.ISSUER))

    const paramsId = request.params.id;

    if (paramsId) {
      // JIKA ADA :id (misal /user/5 atau /project/abc-123)
      // Kita harus cek kepemilikan.
      // Logika ini HANYA untuk endpoint /user/:id
      if (request.route.path.startsWith('/user/')) {
        return Number(paramsId) === user.userId;
      }

      // Nanti kita perlu logika untuk cek kepemilikan /project/:id
      // Tapi untuk sekarang, asumsikan lolos jika role-nya cocok
      return true;
    }

    // JIKA TIDAK ADA :id (misal POST /project)
    // Role sudah dicek (Langkah 4), dan lolos.
    // Maka, return true.
    return true; // <-- INI ADALAH PERBAIKAN UTAMA
  }
}
