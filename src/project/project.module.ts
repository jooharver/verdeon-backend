// src/project/project.module.ts

import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express'; // Import Multer
import { diskStorage } from 'multer'; // Import diskStorage
import { editFileName, imageFileFilter } from '../utils/file-upload.utils'; // Import Helper tadi

// Entities
import { Project } from './entities/project.entity';
import { ProjectSolarIssuerDetail } from './entities/project-solar-issuer-detail.entity';
import { ProjectSolarAuditorDetail } from './entities/project-solar-auditor-detail.entity';
import { ProjectDocument } from './entities/project-document.entity'; // Import Entity baru
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectSolarIssuerDetail,
      ProjectSolarAuditorDetail,
      ProjectDocument, // Daftar Entity Baru
    ]),
    AuthModule,
    
    // --- KONFIGURASI MULTER ---
    MulterModule.register({
      dest: './uploads/projects', // Folder tujuan (pastikan folder ini ada!)
    }),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}