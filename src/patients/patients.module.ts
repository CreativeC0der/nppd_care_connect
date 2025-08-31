import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientRole } from './entities/patient-role.entity';
import { OtpModule } from 'src/Utils/otp/otp.module';
import { AuthModule } from 'src/auth/auth.module';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Patient, PatientRole, Encounter, Organization]), OtpModule, AuthModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService, TypeOrmModule]
})
export class PatientsModule { }
