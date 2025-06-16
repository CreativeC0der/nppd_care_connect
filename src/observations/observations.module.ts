import { Module } from '@nestjs/common';
import { ObservationsController } from './observations.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { ObservationsService } from './observations.service';
import { Observation } from './entities/observation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Encounter, Observation]), HttpModule],
  controllers: [ObservationsController],
  providers: [ObservationsService],
})
export class ObservationsModule { }
