import { Module } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { PractitionersController } from './practitioners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Practitioner } from './entities/practitioner.entity';
import { PractitionerRole } from './entities/practitioner-role.entity';
import { HttpModule } from '@nestjs/axios';
import { Patient } from 'src/patients/entities/patient.entity';
import { OtpModule } from 'src/Utils/otp/otp.module';
import { AuthModule } from 'src/auth/auth.module';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Practitioner, PractitionerRole, Patient, Encounter, Organization]), HttpModule, OtpModule, AuthModule],
  controllers: [PractitionersController],
  providers: [PractitionersService],
  exports: [PractitionersService, TypeOrmModule]
})
export class PractitionersModule { }
