// src/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/enums/role.enum'; // <-- Sesuaikan path ke enum

// Kunci ini akan kita pakai untuk membaca metadata
export const ROLES_KEY = 'roles';

// Ini adalah decorator-nya, misal @Roles(UserRole.ADMIN)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);