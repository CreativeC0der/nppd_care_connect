import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { OtpModule } from 'src/Utils/otp/otp.module';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Patient]), OtpModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService, TypeOrmModule]
})
export class PatientsModule { }
