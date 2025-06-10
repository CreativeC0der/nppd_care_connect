import { Module } from '@nestjs/common';
import { EncountersService } from './encounters.service';
import { EncountersController } from './encounters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { Encounter } from './entities/encounter.entity';
import { PractitionersModule } from 'src/practitioners/practitioners.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Encounter, Practitioner, Patient]), PractitionersModule, HttpModule],
  controllers: [EncountersController],
  providers: [EncountersService],
  exports: [EncountersService, TypeOrmModule]
})
export class EncountersModule { }
