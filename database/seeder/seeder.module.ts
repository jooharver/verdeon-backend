// database/seeder/seeder.module.ts (Koreksi Final)

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- PASTIKAN INI DIIMPOR
import { SeederService } from './seeder.service';

// KOREKSI PATH: Naik 2x (ke root) lalu turun ke src/
// ----------------------------------------------------
import { Project } from '../../src/project/entities/project.entity';
import { ProjectSolarIssuerDetail } from '../../src/project/entities/project-solar-issuer-detail.entity';
import { ProjectSolarAuditorDetail } from '../../src/project/entities/project-solar-auditor-detail.entity';
import { ProjectDocument } from '../../src/project/entities/project-document.entity';
import { User } from '../../src/user/entities/user.entity';
// ----------------------------------------------------

@Module({
  imports: [
    // IMPOR LANGSUNG REPOSITORIES YANG DIBUTUHKAN SERVICE
    TypeOrmModule.forFeature([
      Project,
      ProjectSolarIssuerDetail,
      ProjectSolarAuditorDetail,
      ProjectDocument,
      User,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}