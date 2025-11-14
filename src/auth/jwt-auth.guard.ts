import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard ini akan secara otomatis memvalidasi JWT
 * yang dikirim di header Authorization 'Bearer ...'
 * dan melampirkan payload user ke `req.user`
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
