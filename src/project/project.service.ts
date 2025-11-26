// src/project/project.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as fs from 'fs';

// Entities
import { Project } from './entities/project.entity';
import { ProjectSolarIssuerDetail } from './entities/project-solar-issuer-detail.entity';
import { ProjectSolarAuditorDetail } from './entities/project-solar-auditor-detail.entity';
import { ProjectDocument, DocumentType } from './entities/project-document.entity';

// Enums
import { ProjectStatus, VerificationStatus } from './project.enums';

// DTOs
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateAuditDto } from './dto/create-audit.dto';
import { VerifyProjectDto } from './dto/verify-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    @InjectRepository(ProjectSolarIssuerDetail)
    private issuerDetailRepository: Repository<ProjectSolarIssuerDetail>,

    @InjectRepository(ProjectSolarAuditorDetail)
    private auditorDetailRepository: Repository<ProjectSolarAuditorDetail>,

    @InjectRepository(ProjectDocument)
    private documentRepository: Repository<ProjectDocument>,

    private dataSource: DataSource,
  ) {}

  // --- HELPER UNTUK NORMALISASI PATH (Tambahan untuk kejelasan) ---
  private normalizeFilePath(absolutePath: string): string {
    // Cari indeks 'uploads' dan ambil substring setelahnya.
    const uploadsIndex = absolutePath.indexOf('uploads');
    if (uploadsIndex !== -1) {
      // Ganti backslash (\) dengan forward slash (/) dan kembalikan path relatif.
      return absolutePath.substring(uploadsIndex).replace(/\\/g, '/');
    }
    return absolutePath.replace(/\\/g, '/'); // Fallback jika tidak ditemukan 'uploads'
  }
  // -----------------------------------------------------------------

  // =================================================================
  // 1. CREATE PROJECT (ISSUER)
  // =================================================================
  async create(
    createProjectDto: CreateProjectDto,
    issuerId: number,
    files: { image?: Express.Multer.File[]; document?: Express.Multer.File[] },
  ) {
    const projectCode = `SOL-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, '0')}`;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = this.projectRepository.create({
        name: createProjectDto.name,
        description: createProjectDto.description,
        project_code: projectCode,
        issuer_id: issuerId,
        location_country: createProjectDto.location_country,
        location_province: createProjectDto.location_province,
        location_city: createProjectDto.location_city,
        address: createProjectDto.address,
        project_type: createProjectDto.project_type,
        status: ProjectStatus.SUBMITTED,
        admin_verification_status: VerificationStatus.PENDING,
        auditor_verification_status: VerificationStatus.PENDING,
      });
      const savedProject = await queryRunner.manager.save(project);

      const issuerDetail = this.issuerDetailRepository.create({
        project_id: savedProject.id,
        panel_brand: createProjectDto.panel_brand,
        panel_capacity_wp: createProjectDto.panel_capacity_wp,
        number_of_panels: createProjectDto.number_of_panels,
        inverter_brand: createProjectDto.inverter_brand,
        inverter_capacity_kw: createProjectDto.inverter_capacity_kw,
        installation_type: createProjectDto.installation_type,
        area_size_m2: createProjectDto.area_size_m2,
        installation_date: createProjectDto.installation_date,
        documentation_url: createProjectDto.documentation_url,
      });
      await queryRunner.manager.save(issuerDetail);

      // --- KOREKSI PATH MANUAL UPLOAD ---
      if (files && files.image) {
        for (const file of files.image) {
          const doc = this.documentRepository.create({
            project_id: savedProject.id,
            type: DocumentType.IMAGE,
            original_filename: file.originalname,
            file_path: this.normalizeFilePath(file.path), // <--- KOREKSI DI SINI
            uploader_role: 'issuer',
          });
          await queryRunner.manager.save(doc);
        }
      }

      if (files && files.document) {
        for (const file of files.document) {
          const doc = this.documentRepository.create({
            project_id: savedProject.id,
            type: DocumentType.DOCUMENT,
            original_filename: file.originalname,
            file_path: this.normalizeFilePath(file.path), // <--- KOREKSI DI SINI
            uploader_role: 'issuer',
          });
          await queryRunner.manager.save(doc);
        }
      }

      await queryRunner.commitTransaction();
      return savedProject;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // Perlu juga hapus file yang sudah terupload ke disk jika transaksi gagal
      if (files && files.image) files.image.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
      if (files && files.document) files.document.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // =================================================================
  // 2. ADMIN PROCESS VERIFICATION (Tidak ada perubahan path)
  // =================================================================
  async processAdminVerification(id: string, dto: VerifyProjectDto) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    project.admin_verification_status = dto.status;
    project.admin_notes = dto.admin_notes ?? null;

    if (dto.status === VerificationStatus.VERIFIED) {
      if (!dto.auditor_id) {
        throw new BadRequestException('Auditor must be assigned when verifying project');
      }
      project.auditor_id = dto.auditor_id;
      project.status = ProjectStatus.ON_REVIEW;
    
    } else if (dto.status === VerificationStatus.REJECTED) {
      project.status = ProjectStatus.REJECTED;
    
    } else if (dto.status === VerificationStatus.REVISION) {
      project.status = ProjectStatus.REVISION;
    }

    return this.projectRepository.save(project);
  }

  // =================================================================
  // 3. AUDITOR SUBMIT
  // =================================================================
  async submitAudit(
    projectId: string,
    auditorId: number,
    dto: CreateAuditDto,
    files: { 
      audit_documents?: Express.Multer.File[]; 
      audit_images?: Express.Multer.File[] 
    },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = await this.projectRepository.findOne({ where: { id: projectId } });
      if (!project) throw new NotFoundException('Project not found');

      if (project.auditor_id !== auditorId) {
        throw new ForbiddenException('You are not assigned to audit this project');
      }

      if (project.status !== ProjectStatus.ON_REVIEW) {
        throw new BadRequestException('Project is not ready for audit');
      }

      // --- KOREKSI PATH AUDIT DOCUMENTS ---
      if (files.audit_documents && files.audit_documents.length > 0) {
        for (const file of files.audit_documents) {
          const doc = this.documentRepository.create({
            project_id: projectId,
            type: DocumentType.AUDIT_REPORT,
            original_filename: file.originalname,
            file_path: this.normalizeFilePath(file.path), // <--- KOREKSI DI SINI
            uploader_role: 'auditor',
          });
          await queryRunner.manager.save(doc);
        }
      }

      // --- KOREKSI PATH AUDIT IMAGES ---
      if (files.audit_images && files.audit_images.length > 0) {
        for (const file of files.audit_images) {
          const img = this.documentRepository.create({
            project_id: projectId,
            type: DocumentType.IMAGE,
            original_filename: file.originalname,
            file_path: this.normalizeFilePath(file.path), // <--- KOREKSI DI SINI
            uploader_role: 'auditor',
          });
          await queryRunner.manager.save(img);
        }
      }

      let auditDetail = await this.auditorDetailRepository.findOne({
        where: { project_id: projectId },
      });

      // KOREKSI PATH untuk auditor_documentation_url
      const mainDocPath = files.audit_documents && files.audit_documents.length > 0 
        ? this.normalizeFilePath(files.audit_documents[0].path) // <--- KOREKSI DI SINI
        : '';

      if (!auditDetail) {
        auditDetail = this.auditorDetailRepository.create({
          project_id: projectId,
          verified_installed_capacity_kwp: dto.verified_installed_capacity_kwp,
          verified_annual_generation_kwh: dto.verified_annual_generation_kwh,
          baseline_emission_factor: dto.baseline_emission_factor,
          expected_carbon_reduction_ton_per_year: dto.expected_carbon_reduction_ton_per_year,
          onsite_measurement_date: dto.onsite_measurement_date,
          audit_notes: dto.audit_notes,
          audit_status: dto.audit_status,
          auditor_documentation_url: mainDocPath,
        });
      } else {
        auditDetail.verified_installed_capacity_kwp = dto.verified_installed_capacity_kwp;
        auditDetail.verified_annual_generation_kwh = dto.verified_annual_generation_kwh;
        auditDetail.baseline_emission_factor = dto.baseline_emission_factor;
        auditDetail.expected_carbon_reduction_ton_per_year = dto.expected_carbon_reduction_ton_per_year;
        auditDetail.onsite_measurement_date = dto.onsite_measurement_date;
        auditDetail.audit_notes = dto.audit_notes;
        auditDetail.audit_status = dto.audit_status;
        if (mainDocPath) {
            auditDetail.auditor_documentation_url = mainDocPath;
        }
      }
      
      await queryRunner.manager.save(auditDetail);

      project.auditor_verification_status = dto.audit_status;

      if (dto.audit_status === VerificationStatus.VERIFIED) {
        if (project.admin_verification_status === VerificationStatus.VERIFIED) {
           project.status = ProjectStatus.LISTED;
        }
      } else if (dto.audit_status === VerificationStatus.REJECTED) {
         project.status = ProjectStatus.REJECTED;
      } else if (dto.audit_status === VerificationStatus.REVISION) {
         project.status = ProjectStatus.REVISION;
      }

      await queryRunner.manager.save(project);
      await queryRunner.commitTransaction();

      return {
        message: 'Audit submitted successfully',
        global_status: project.status,
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (files.audit_documents) files.audit_documents.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
      if (files.audit_images) files.audit_images.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // =================================================================
  // 4. FIND ALL ADMIN (FIXED RELATIONS)
  // =================================================================
  async findAllAdmin() {
    return this.projectRepository.find({
      // Tambahkan 'auditorDetail' agar admin juga bisa lihat hasil audit
      relations: ['issuer', 'auditor', 'issuerDetail', 'auditorDetail', 'documents'],
      order: { created_at: 'DESC' },
    });
  }

  // =================================================================
  // 5. UPDATE PROJECT (ISSUER)
  // =================================================================
  async update(
    id: string,
    updateDto: UpdateProjectDto,
    issuerId: number,
    files?: { image?: Express.Multer.File[]; document?: Express.Multer.File[] },
  ) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['issuerDetail'],
    });

    if (!project) throw new NotFoundException('Project not found');
    if (project.issuer_id !== issuerId) throw new ForbiddenException('Forbidden');

    if (
      project.status === ProjectStatus.LISTED || 
      project.status === ProjectStatus.ON_REVIEW
    ) {
      throw new BadRequestException('Cannot edit project while it is under review or listed');
    }

    if (project.status === ProjectStatus.REVISION) {
      project.status = ProjectStatus.SUBMITTED;
      project.admin_verification_status = VerificationStatus.PENDING;
      project.auditor_verification_status = VerificationStatus.PENDING;
      await this.projectRepository.save(project);
    }

    let dataToUpdate: any = { ...updateDto };
    let filesToProcess = { ...files };

    const {
      panel_brand,
      panel_capacity_wp,
      number_of_panels,
      inverter_brand,
      inverter_capacity_kw,
      installation_type,
      area_size_m2,
      installation_date,
      documentation_url,
      ...projectData
    } = dataToUpdate;

    if (Object.keys(projectData).length > 0) {
      await this.projectRepository.update(id, projectData);
    }

    const detailUpdates: any = {};
    if (panel_brand) detailUpdates.panel_brand = panel_brand;
    if (panel_capacity_wp) detailUpdates.panel_capacity_wp = panel_capacity_wp;
    if (number_of_panels) detailUpdates.number_of_panels = number_of_panels;
    if (inverter_brand) detailUpdates.inverter_brand = inverter_brand;
    if (inverter_capacity_kw) detailUpdates.inverter_capacity_kw = inverter_capacity_kw;
    if (installation_type) detailUpdates.installation_type = installation_type;
    if (area_size_m2) detailUpdates.area_size_m2 = area_size_m2;
    if (installation_date) detailUpdates.installation_date = installation_date;
    if (documentation_url) detailUpdates.documentation_url = documentation_url;

    if (Object.keys(detailUpdates).length > 0) {
      await this.issuerDetailRepository.update({ project_id: id }, detailUpdates);
    }

    if (filesToProcess.image) {
      for (const file of filesToProcess.image) {
        const doc = this.documentRepository.create({
          project_id: id,
          type: DocumentType.IMAGE,
          original_filename: file.originalname,
          file_path: this.normalizeFilePath(file.path), // <--- KOREKSI DI SINI
          uploader_role: 'issuer',
        });
        await this.documentRepository.save(doc);
      }
    }
    if (filesToProcess.document) {
      for (const file of filesToProcess.document) {
        const doc = this.documentRepository.create({
          project_id: id,
          type: DocumentType.DOCUMENT,
          original_filename: file.originalname,
          file_path: this.normalizeFilePath(file.path), // <--- KOREKSI DI SINI
          uploader_role: 'issuer',
        });
        await this.documentRepository.save(doc);
      }
    }

    return this.findOne(id);
  }

  // =================================================================
  // 6. HELPER & PUBLIC METHODS
  // =================================================================
  
  async removeDocument(documentId: string, issuerId: number) {
    const doc = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['project'],
    });

    if (!doc) throw new NotFoundException('Document not found');
    if (doc.project.issuer_id !== issuerId) throw new ForbiddenException('Forbidden');

    if (doc.project.status === ProjectStatus.LISTED && doc.type !== DocumentType.IMAGE) {
      throw new BadRequestException('Cannot delete legal documents of a listed project');
    }

    try {
      if (fs.existsSync(doc.file_path)) fs.unlinkSync(doc.file_path);
    } catch (err) {
      console.warn(`Failed to delete file from disk: ${doc.file_path}`, err);
    }
    return this.documentRepository.remove(doc);
  }

  // --- PUBLIC GET ---
  async findAll() {
    return this.projectRepository.find({
      // Tambahkan 'issuer' agar di halaman publik terlihat siapa pemiliknya
      select: ['id', 'project_code', 'name', 'location_city', 'status', 'created_at'],
      relations: ['issuerDetail', 'documents', 'issuer'], 
    });
  }

  // --- FIX BUG UTAMA: FIND BY ISSUER ---
  async findByIssuer(issuerId: number) {
    return this.projectRepository.find({
      where: { issuer_id: issuerId },
      // PERBAIKAN: Load semua relasi lengkap
      // 'issuer' -> Agar tidak "Unknown User"
      // 'auditorDetail' -> Agar tidak "Audit Pending" padahal sudah selesai
      relations: [
        'issuer', 
        'issuerDetail', 
        'auditor', 
        'auditorDetail', 
        'documents'
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: [
        'issuer',
        'auditor', 
        'issuerDetail',
        'auditorDetail',
        'documents',
      ],
    });
    if (!project) throw new NotFoundException(`Project with ID ${id} not found`);
    return project;
  }

  async remove(id: string, issuerId: number) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.issuer_id !== issuerId) throw new ForbiddenException('Forbidden');
    return this.projectRepository.remove(project);
  }
}