import { Module } from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { MedicationsController } from './medications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsModule } from 'src/patients/patients.module';
import { PractitionersModule } from 'src/practitioners/practitioners.module';
import { EncountersModule } from 'src/encounters/encounters.module';
import { HttpModule } from '@nestjs/axios';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { MedicationRequest } from './entities/medication-request.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Medication } from './entities/medication.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicationRequest, Patient, Practitioner, Encounter, Medication]), PatientsModule, PractitionersModule, EncountersModule, HttpModule],
  controllers: [MedicationsController],
  providers: [MedicationsService],
  exports: [MedicationsService]
})
export class MedicationsModule { }
