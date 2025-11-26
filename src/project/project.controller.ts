// src/project/project.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/role.enum';

import { FileFieldsInterceptor } from '@nestjs/platform-express'; // Perhatikan import ini
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../utils/file-upload.utils';
import { CreateAuditDto } from './dto/create-audit.dto';
import { VerifyProjectDto } from './dto/verify-project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // --- 1. CREATE PROJECT (ISSUER) ---
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ISSUER)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 5 },
        { name: 'document', maxCount: 5 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/projects',
          filename: editFileName,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; document?: Express.Multer.File[] },
  ) {
    const issuerId = req.user.userId;
    return this.projectService.create(createProjectDto, issuerId, files);
  }

  // --- 2. DELETE DOCUMENT ---
  @Delete('document/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ISSUER)
  removeDocument(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const issuerId = req.user.userId;
    return this.projectService.removeDocument(id, issuerId);
  }

  // --- 3. GET MY PROJECTS ---
  @Get('my-projects')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ISSUER)
  findMyProjects(@Request() req) {
    const issuerId = req.user.userId;
    return this.projectService.findByIssuer(issuerId);
  }

  // --- 4. ADMIN & AUDITOR: GET ALL ---
  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  findAllAdmin() {
    return this.projectService.findAllAdmin();
  }

  // --- 5. ADMIN: PROCESS VERIFICATION ---
  @Patch(':id/admin-process')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  processAdminVerification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() verifyDto: VerifyProjectDto,
  ) {
    return this.projectService.processAdminVerification(id, verifyDto);
  }

  // --- 6. AUDITOR: SUBMIT AUDIT (UPDATED MULTIPLE FILES) ---
  @Post(':id/audit')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.AUDITOR)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audit_documents', maxCount: 5 }, // PDF Laporan (Bisa banyak)
        { name: 'audit_images', maxCount: 5 },    // Bukti Foto (Bisa banyak)
      ],
      {
        storage: diskStorage({
          destination: './uploads/audit-reports',
          filename: editFileName,
        }),
        // Note: imageFileFilter biasanya cuma allow gambar. 
        // Jika ingin allow PDF + Gambar, custom filter atau biarkan default (tergantung setup utils mu)
        // Disini saya asumsikan logic filter aman atau kamu buat filter baru yang allow PDF & Image.
      },
    ),
  )
  submitAudit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createAuditDto: CreateAuditDto,
    @Request() req,
    @UploadedFiles()
    files: { 
      audit_documents?: Express.Multer.File[]; 
      audit_images?: Express.Multer.File[] 
    },
  ) {
    // Validasi minimal ada 1 dokumen laporan
    if (!files || !files.audit_documents || files.audit_documents.length === 0) {
      throw new BadRequestException('At least one audit report document is required');
    }
    
    const auditorId = req.user.userId;
    return this.projectService.submitAudit(id, auditorId, createAuditDto, files);
  }

  // --- PUBLIC ENDPOINTS ---
  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.findOne(id);
  }

  // --- UPDATE & DELETE ---
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ISSUER)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 5 },
        { name: 'document', maxCount: 5 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/projects',
          filename: editFileName,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; document?: Express.Multer.File[] },
  ) {
    const issuerId = req.user.userId;
    return this.projectService.update(id, updateProjectDto, issuerId, files);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ISSUER)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const issuerId = req.user.userId;
    return this.projectService.remove(id, issuerId);
  }
}