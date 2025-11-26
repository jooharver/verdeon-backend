// database/seeder/seeder.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// KOREKSI PATH: Naik ke root (../../) lalu turun ke src/
import { User } from '../../src/user/entities/user.entity'; 
import { Project } from '../../src/project/entities/project.entity'; 
import { ProjectSolarIssuerDetail } from '../../src/project/entities/project-solar-issuer-detail.entity'; 
import { ProjectSolarAuditorDetail } from '../../src/project/entities/project-solar-auditor-detail.entity'; 
import { ProjectDocument, DocumentType } from '../../src/project/entities/project-document.entity'; 
import { projectMockData } from './project-mock.data'; 
import { ProjectStatus, VerificationStatus } from '../../src/project/project.enums';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  // Tentukan PATH untuk assets dan uploads
  private readonly ASSETS_PATH = path.join(__dirname, 'assets');
  private readonly ASSETS_DOKUMEN_PATH = path.join(this.ASSETS_PATH, 'dokumen');
  private readonly ASSETS_GAMBAR_PATH = path.join(this.ASSETS_PATH, 'gambar');
  private readonly UPLOADS_PROJECTS_PATH = path.join(process.cwd(), 'uploads/projects');

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectSolarIssuerDetail)
    private readonly issuerDetailRepository: Repository<ProjectSolarIssuerDetail>,
    @InjectRepository(ProjectSolarAuditorDetail)
    private readonly auditorDetailRepository: Repository<ProjectSolarAuditorDetail>,
    @InjectRepository(ProjectDocument)
    private readonly documentRepository: Repository<ProjectDocument>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  
  /**
   * Fungsi helper untuk menyalin file dari source ke destination dan mengembalikan path baru.
   */
  private copyFile(sourceDir: string, fileName: string, projectId: string, fileType: 'pdd' | 'izin' | 'img'): string | null {
    const sourceFile = path.join(sourceDir, fileName);
    
    if (!fs.existsSync(sourceFile)) {
      this.logger.warn(`File ${fileType} tidak ditemukan: ${sourceFile}. Mengabaikan.`);
      return null;
    }

    const uniqueFileName = `${projectId}-${fileType}-${fileName}`;
    const destFile = path.join(this.UPLOADS_PROJECTS_PATH, uniqueFileName);

    try {
      fs.copyFileSync(sourceFile, destFile);
      return `/uploads/projects/${uniqueFileName}`; 
    } catch (error) {
      this.logger.error(`Gagal menyalin file ${fileName}:`, error.message);
      return null;
    }
  }


  async seed() {
    this.logger.log('Memulai Seeding Data Verdeon...');
    
    // 1. Hapus data Project yang sudah ada (TRUNCATE)
    try {
        // --- NONAKTIFKAN FOREIGN KEY CHECKS (WAJIB UNTUK MYSQL) ---
        await this.projectRepository.query('SET FOREIGN_KEY_CHECKS = 0;');

        // TRUNCATE semua tabel anak dan induk
        await this.auditorDetailRepository.query('TRUNCATE TABLE project_solar_auditor_details;');
        await this.issuerDetailRepository.query('TRUNCATE TABLE project_solar_issuer_details;');
        await this.documentRepository.query('TRUNCATE TABLE project_documents;');
        await this.projectRepository.query('TRUNCATE TABLE projects;');
        
        // --- AKTIFKAN KEMBALI FOREIGN KEY CHECKS ---
        await this.projectRepository.query('SET FOREIGN_KEY_CHECKS = 1;');
        
        this.logger.log('Data proyek lama berhasil dihapus.');
    } catch (e) {
        // PENTING: Jika gagal, pastikan checks diaktifkan kembali
        await this.projectRepository.query('SET FOREIGN_KEY_CHECKS = 1;');
        this.logger.error('Gagal TRUNCATE data. Periksa kembali log error SQL di atas.', e.message);
        return; 
    }

    // 2. Pastikan folder UPLOADS ada
    if (!fs.existsSync(this.UPLOADS_PROJECTS_PATH)) {
      fs.mkdirSync(this.UPLOADS_PROJECTS_PATH, { recursive: true });
      this.logger.log(`Folder ${this.UPLOADS_PROJECTS_PATH} dibuat.`);
    }

    // 3. Ambil User SPESIFIK: ISSUER (ID 20)
    const issuerUser = await this.userRepository.findOne({ where: { id: 20 as any } }); 

    if (!issuerUser) {
      this.logger.error('❌ Tidak ada user ISSUER ditemukan dengan ID 20.');
      return;
    }
    
    this.logger.log(`User ISSUER (ID: ${issuerUser.id}) ditemukan. Memulai pembuatan ${projectMockData.length} proyek...`);


    // 4. Masukkan Data Mock
    for (const mock of projectMockData) {
        
      // Tambahkan random unique code untuk project_code (Solusi Error Duplicate Entry)
      const uniqueProjectCode = `SEED-${new Date().getTime()}-${Math.random().toString(36).substring(2, 7)}`;

      const project = this.projectRepository.create({
        ...(mock.project as any),
        project_code: uniqueProjectCode, // <-- PAKSA KODE UNIK
        issuer: issuerUser as any, 
        auditor: null as any, 
      });
      
      let savedProject = await this.projectRepository.save(project) as unknown as Project;
      const projectId = savedProject.id; 
      
      this.logger.log(`Proyek Draft ${savedProject.name} (ID: ${projectId}) berhasil dibuat.`);


      // --- LOGIKA COPY FILE DOKUMEN & SIMPAN KE ProjectDocument ---

      // A. Copy PDD File
      const pddFileName = mock.project.source_pdd_file;
      const pddPath = this.copyFile(this.ASSETS_DOKUMEN_PATH, pddFileName, projectId, 'pdd');
      
      if (pddPath) {
          await this.documentRepository.save(this.documentRepository.create({
             project_id: projectId,
             type: DocumentType.DOCUMENT, 
             original_filename: pddFileName,
             file_path: pddPath,
             uploader_role: 'issuer',
          }));
      }
      
      // B. Copy Surat Izin File
      const izinFileName = mock.project.source_izin_file;
      const izinPath = this.copyFile(this.ASSETS_DOKUMEN_PATH, izinFileName, projectId, 'izin');
      
      if (izinPath) {
          await this.documentRepository.save(this.documentRepository.create({
             project_id: projectId,
             type: DocumentType.DOCUMENT, 
             original_filename: izinFileName,
             file_path: izinPath,
             uploader_role: 'issuer',
          }));
      }

      // --- LOGIKA COPY FILE GAMBAR (Image Gallery) ---

      const documentsToSave: ProjectDocument[] = [];
      const imageFiles = mock.project.source_image_files || [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const imgFileName = imageFiles[i];
        const imgPath = this.copyFile(this.ASSETS_GAMBAR_PATH, imgFileName, projectId, 'img');

        if (imgPath) {
          const projectDocument = this.documentRepository.create({
            project: savedProject,
            project_id: projectId,
            type: DocumentType.IMAGE, 
            original_filename: imgFileName,
            file_path: imgPath,
            uploader_role: 'issuer',
          });
          documentsToSave.push(projectDocument);
        }
      }
      
      await this.documentRepository.save(documentsToSave);
      
      
      // --- Simpan Detail ISSUER ---
      const issuerDetail = this.issuerDetailRepository.create({
        ...mock.detail,
        project: savedProject,
        documentation_url: mock.detail.documentation_url || undefined,
      });
      await this.issuerDetailRepository.save(issuerDetail);

      // --- Simpan Detail AUDITOR (Hanya jika mock.audit ada) ---
      if (mock.audit) { 
          const auditorDetail = this.auditorDetailRepository.create({
              ...mock.audit,
              project: savedProject,
              project_id: projectId,
              auditor_documentation_url: `/uploads/audit-reports/${projectId}-audit-report-dummy.pdf`, 
          });
          await this.auditorDetailRepository.save(auditorDetail);
          
          // Update status verifikasi auditor di Project Entity
          savedProject.auditor_verification_status = mock.audit.audit_status as VerificationStatus;
          
          // Update status global
          if (mock.audit.audit_status === VerificationStatus.VERIFIED) {
              if (savedProject.admin_verification_status === VerificationStatus.VERIFIED) {
                  savedProject.status = ProjectStatus.LISTED;
              }
          } else if (mock.audit.audit_status === VerificationStatus.REVISION) {
              savedProject.status = ProjectStatus.REVISION;
          } else if (mock.audit.audit_status === VerificationStatus.REJECTED) {
              savedProject.status = ProjectStatus.REJECTED;
          }
      }
      
      // Simpan Project Entity terakhir kali untuk update status global
      await this.projectRepository.save(savedProject);
      
      this.logger.log(`✅ Proyek ${savedProject.name} selesai di-seed.`);
    }

    this.logger.log('Seeding Data Selesai! 🎉 Anda siap testing.');
  }
}