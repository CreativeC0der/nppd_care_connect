import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosticReport } from './entities/diagnostic-report.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Observation } from 'src/observations/entities/observation.entity';
import { ServiceRequest } from 'src/service-requests/entities/service-request.entity';
import { DiagnosticReportsController } from './diagnostic-reports.controller';
import { DiagnosticReportsService } from './diagnostic-reports.service';

@Module({
    imports: [TypeOrmModule.forFeature([DiagnosticReport, Patient, Encounter, Observation, ServiceRequest])],
    controllers: [DiagnosticReportsController],
    providers: [DiagnosticReportsService],
    exports: []
})
export class DiagnosticReportsModule { } 