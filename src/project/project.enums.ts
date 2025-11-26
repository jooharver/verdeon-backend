// src/project/project.enums.ts

export enum ProjectStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ON_REVIEW = 'on_review',
  LISTED = 'listed',
  REJECTED = 'rejected',
  REVISION = 'revision',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  REVISION = 'revision',
}

export enum ProjectType {
  SOLAR = 'solar',
}