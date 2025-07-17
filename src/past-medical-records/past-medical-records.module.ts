import { Module } from '@nestjs/common';
import { PastMedicalRecordsService } from './past-medical-records.service';
import { PastMedicalRecordsController } from './past-medical-records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/past-medical-record.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, Encounter])],
  controllers: [PastMedicalRecordsController],
  providers: [PastMedicalRecordsService],
})
export class PastMedicalRecordsModule { }
