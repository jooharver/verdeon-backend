import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Butuh ConfigService
  providers: [EmailService],
  exports: [EmailService], // Ekspor agar bisa dipakai di AuthModule
})
export class EmailModule {}