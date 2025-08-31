import { Module } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { ProceduresController } from './procedures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Procedure } from './entities/procedure.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import { DiagnosticReport } from 'src/diagnostic-reports/entities/diagnostic-report.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Procedure, Patient, Encounter, Condition, DiagnosticReport, Organization])],
    controllers: [ProceduresController],
    providers: [ProceduresService],
    exports: [ProceduresService, TypeOrmModule]
})
export class ProceduresModule { } 