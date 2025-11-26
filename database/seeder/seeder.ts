// database/seeder/seeder.ts (Kode yang Diperbaiki)

import { NestFactory } from '@nestjs/core';
import { SeederService } from './seeder.service';
// Naik ke root (../../) lalu turun ke src/app.module
import { AppModule } from '../../src/app.module'; 

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const seeder = appContext.get(SeederService);

  try {
    console.log('--- STARTING VERDEON SEEDER ---');
    await seeder.seed();
    
    await appContext.close();
    console.log('--- SEEDING COMPLETE. PROCESS EXIT 0 ---');
    process.exit(0);
  } catch (error) {
    console.error('SEEDED GAGAL:', error);
    await appContext.close();
    console.log('--- SEEDING FAILED. PROCESS EXIT 1 ---');
    process.exit(1);
  }
}

bootstrap();