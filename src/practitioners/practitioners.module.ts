import { Module } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { PractitionersController } from './practitioners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Practitioner } from './entities/practitioner.entity';
import { HttpModule } from '@nestjs/axios';
import { Patient } from 'src/patients/entities/patient.entity';
import { OtpModule } from 'src/Utils/otp/otp.module';

@Module({
  imports: [TypeOrmModule.forFeature([Practitioner, Patient]), HttpModule, OtpModule],
  controllers: [PractitionersController],
  providers: [PractitionersService],
  exports: [PractitionersService, TypeOrmModule]
})
export class PractitionersModule { }
