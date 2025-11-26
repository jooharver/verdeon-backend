// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { SeederModule } from '../database/seeder/seeder.module';
import { ServeStaticModule } from '@nestjs/serve-static'; // <--- BARU
import { join } from 'path'; // <--- BARU
import * as process from 'process'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),

    // --- KONFIGURASI STATIC FILES (SOLUSI GAMBAR) ---
    ServeStaticModule.forRoot({
      // MENGGUNAKAN process.cwd() UNTUK JALUR ABSOLUT KE ROOT PROYEK
      rootPath: join(process.cwd(), 'uploads'), // <--- KOREKSI KRITIS
      serveRoot: '/uploads', 
    }),
    // ----------------------------------------------------

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'verdeon_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    ProjectModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}