// database/seeder/project-mock.data.ts

import { InstallationType } from '../../src/project/entities/project-solar-issuer-detail.entity'; 
import { ProjectType, ProjectStatus, VerificationStatus } from '../../src/project/project.enums'; 

export const projectMockData = [
  // --- Proyek 1: CV Tirta Sumber Abadi (LISTED) ---
  {
    project: {
      name: 'PLTS CV Tirta Sumber Abadi',
      description: 'Pemasangan PLTS Atap untuk kebutuhan operasional perusahaan air minum.',
      location_country: 'Indonesia',
      location_province: 'Jawa Tengah',
      location_city: 'Semarang',
      address: 'Jl. Air Bersih No. 10',
      project_type: ProjectType.SOLAR,
      status: ProjectStatus.LISTED, 
      issuer_id: 20, 
      auditor_id: null, 
      
      source_pdd_file: 'Project Design Document CV Tirta Sumber Abadi.pdf',
      source_izin_file: 'Surat Izin Proyek CV Tirta Sumber Abadi.pdf', 
      source_image_files: [ 'CV_Tirta_Sumber_Abadi_1.jpg', 'CV_Tirta_Sumber_Abadi_2.jpg', 'CV_Tirta_Sumber_Abadi_3.jpg', 'CV_Tirta_Sumber_Abadi_4.jpg', 'CV_Tirta_Sumber_Abadi_5.jpg' ],
    },
    detail: {
      panel_brand: 'SolarX Pro',
      panel_capacity_wp: 450,
      number_of_panels: 600,
      inverter_brand: 'InverterMax 200',
      inverter_capacity_kw: 200,
      installation_type: InstallationType.ROOFTOP,
      area_size_m2: 1200,
      installation_date: '2023-01-15',
      documentation_url: 'https://docs.tirtaabadi.com/proyek-plts',
    },
    audit: {
        verified_installed_capacity_kwp: 270,
        verified_annual_generation_kwh: 350000,
        baseline_emission_factor: 0.86,
        expected_carbon_reduction_ton_per_year: 301,
        onsite_measurement_date: '2024-10-01',
        audit_notes: 'Data teknis issuer telah diverifikasi di lapangan.',
        audit_status: VerificationStatus.VERIFIED,
    }
  },
  
  // --- Proyek 2: Perumahan Jaya Asri Syariah (ON_REVIEW) ---
  {
    project: {
      name: 'PLTS Komunal Perumahan Jaya Asri',
      description: 'Pemasangan PLTS untuk penerangan jalan dan fasilitas umum perumahan syariah.',
      location_country: 'Indonesia',
      location_province: 'Jawa Barat',
      location_city: 'Bandung',
      address: "Jl. Syar'iah Utama Blok A",
      project_type: ProjectType.SOLAR,
      status: ProjectStatus.ON_REVIEW, 
      admin_verification_status: VerificationStatus.VERIFIED,
      issuer_id: 20,
      auditor_id: null,
      
      source_pdd_file: 'Project Design Document Perumahan Asri Jaya Syariah.pdf', 
      source_izin_file: 'Surat Izin Proyek Perumahan Asri Jaya Syariah.pdf', 
      source_image_files: [ 'Perumahan_Jaya_Asri_Syariah_1.jpg', 'Perumahan_Jaya_Asri_Syariah_2.jpg', 'Perumahan_Jaya_Asri_Syariah_3.jpg', 'Perumahan_Jaya_Asri_Syariah_4.jpg', 'Perumahan_Jaya_Asri_Syariah_5.jpg' ],
    },
    detail: {
      panel_brand: 'EcoPanel Lite',
      panel_capacity_wp: 400,
      number_of_panels: 300,
      inverter_brand: 'InverterBasic 100',
      inverter_capacity_kw: 100,
      installation_type: InstallationType.GROUND_MOUNTED,
      area_size_m2: 800,
      installation_date: '2024-03-01',
      documentation_url: null,
    },
    audit: { 
        verified_installed_capacity_kwp: 110,
        verified_annual_generation_kwh: 140000,
        baseline_emission_factor: 0.88,
        expected_carbon_reduction_ton_per_year: 123,
        onsite_measurement_date: '2024-11-20',
        audit_notes: 'Perlu revisi dokumen sertifikasi panel.',
        audit_status: VerificationStatus.REVISION, 
    }
  },
  
  // --- Proyek 3: PT Cahaya Maju Sentosa (SUBMITTED) ---
  {
    project: {
      name: 'PLTS Pabrik PT Cahaya Maju Sentosa',
      description: 'PLTS Atap untuk mengurangi biaya listrik pabrik tekstil.',
      location_country: 'Indonesia',
      location_province: 'Banten',
      location_city: 'Tangerang',
      address: 'Kawasan Industri Budi Karya',
      project_type: ProjectType.SOLAR,
      status: ProjectStatus.SUBMITTED, 
      issuer_id: 20,
      auditor_id: null, 
      
      source_pdd_file: 'Project Design Document PT Cahaya Maju Sentosa.pdf', 
      source_izin_file: 'Surat Izin Proyek PT Cahaya Maju Sentosa.pdf', 
      source_image_files: [ 'PT_Cahaya_Maju_Sentosa_1.jpg', 'PT_Cahaya_Maju_Sentosa_2.jpg', 'PT_Cahaya_Maju_Sentosa_3.jpg', 'PT_Cahaya_Maju_Sentosa_4.jpg', 'PT_Cahaya_Maju_Sentosa_5.jpg' ],
    },
    detail: {
      panel_brand: 'PowerCell',
      panel_capacity_wp: 500,
      number_of_panels: 2000,
      inverter_brand: 'Industry Inverter 750',
      inverter_capacity_kw: 750,
      installation_type: InstallationType.ROOFTOP,
      area_size_m2: 4500,
      installation_date: '2022-11-20',
      documentation_url: 'https://docs.cahayamaju.com/pabrik-plts',
    },
    audit: null 
  },
  
  // --- Proyek 4: PT Chandra Daya Sumber Energi (DRAFT) ---
  {
    project: {
      name: 'PLTS PT Chandra Daya',
      description: 'Pemasangan PLTS di lahan terbuka untuk menyuplai kantor pusat.',
      location_country: 'Indonesia',
      location_province: 'DKI Jakarta',
      location_city: 'Jakarta Timur',
      address: 'Jl. Kayu Putih No. 1',
      project_type: ProjectType.SOLAR,
      status: ProjectStatus.DRAFT, 
      issuer_id: 20,
      auditor_id: null,
      
      source_pdd_file: 'Project Design Document PT Chandra Daya Sumber Energi.pdf', 
      source_izin_file: 'Surat Izin Proyek PT Chandra Daya Sumber Energi.pdf', 
      source_image_files: [ 'PT_Chandra_Daya_Sumber_Energi_1.jpg', 'PT_Chandra_Daya_Sumber_Energi_2.jpg', 'PT_Chandra_Daya_Sumber_Energi_3.jpg', 'PT_Chandra_Daya_Sumber_Energi_3 - Copy.jpg', 'PT_Chandra_Daya_Sumber_Energi_4.jpg', 'PT_Chandra_Daya_Sumber_Energi_4 - Copy.jpg', 'PT_Chandra_Daya_Sumber_Energi_5.jpg' ],
    },
    detail: {
      panel_brand: 'MonoLux',
      panel_capacity_wp: 400,
      number_of_panels: 1000,
      inverter_brand: 'InverterPlus 350',
      inverter_capacity_kw: 350,
      installation_type: InstallationType.GROUND_MOUNTED,
      area_size_m2: 2500,
      installation_date: '2024-01-01',
      documentation_url: 'http://chandra.daya.com/dokumen',
    },
    audit: null 
  },
  
  // --- Proyek 5: Rumah Ternak Sentosa (LISTED) ---
  {
    project: {
      name: 'PLTS Rumah Ternak Sentosa',
      description: 'PLTS Atap untuk kebutuhan listrik peternakan ayam.',
      location_country: 'Indonesia',
      location_province: 'Jawa Timur',
      location_city: 'Malang',
      address: 'Jln. Peternakan Sehat No. 1',
      project_type: ProjectType.SOLAR,
      status: ProjectStatus.LISTED, 
      issuer_id: 20,
      auditor_id: null,
      
      source_pdd_file: 'Project Design Document Rumah Ternak Sentosa.pdf', 
      source_izin_file: 'Surat Izin Proyek Rumah Ternak Sentosa.pdf', 
      source_image_files: [ 'Rumah_Ternak_Sentosa_1.jpg', 'Rumah_Ternak_Sentosa_2.jpg', 'Rumah_Ternak_Sentosa_3.jpg', 'Rumah_Ternak_Sentosa_4.jpg', 'Rumah_Ternak_Sentosa_5.jpg' ],
    },
    detail: {
      panel_brand: 'SolarFarm',
      panel_capacity_wp: 420,
      number_of_panels: 200,
      inverter_brand: 'FarmInverter',
      inverter_capacity_kw: 60,
      installation_type: InstallationType.ROOFTOP,
      area_size_m2: 500,
      installation_date: '2024-08-10',
      documentation_url: null,
    },
    audit: {
        verified_installed_capacity_kwp: 85,
        verified_annual_generation_kwh: 110000,
        baseline_emission_factor: 0.85,
        expected_carbon_reduction_ton_per_year: 93,
        onsite_measurement_date: '2024-11-01',
        audit_notes: 'Audit lapangan sesuai. Proyek siap listing.',
        audit_status: VerificationStatus.VERIFIED,
    }
  },
];