import { Module } from '@nestjs/common';
import { ConditionsService } from './conditions.service';
import { ConditionsController } from './conditions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Condition } from './entities/condition.entity';
import { Organization } from 'src/organizations/entities/organization.entity';
import { HttpModule, HttpService } from '@nestjs/axios';
import { PatientsModule } from 'src/patients/patients.module';

@Module({
  imports: [TypeOrmModule.forFeature([Condition, Patient, Encounter, Organization]), HttpModule, PatientsModule], // Add this line to import the module for your entity
  controllers: [ConditionsController],
  providers: [ConditionsService],
  exports: [ConditionsService, TypeOrmModule]
})
export class ConditionsModule { }
