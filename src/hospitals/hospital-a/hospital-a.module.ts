import { Module } from '@nestjs/common';
import { HospitalAService } from './hospital-a.service';
import { HttpModule } from '@nestjs/axios';
import { Patient } from 'src/patients/entities/patient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { Organization } from 'src/organizations/entities/organization.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import { MedicationRequest } from 'src/medications/entities/medication-request.entity';
import { Medication } from 'src/medications/entities/medication.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Slot } from 'src/schedules/entities/slot.entity';
import { RedisModule } from 'src/Utils/redis/redis.module';
import { Observation } from 'src/observations/entities/observation.entity';
import { DiagnosticReport } from 'src/diagnostic-reports/entities/diagnostic-report.entity';
import { Procedure } from 'src/procedures/entities/procedure.entity';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([
        Patient, Encounter, Practitioner, Organization, Condition, MedicationRequest, Medication, Appointment,
        Schedule, Slot, Observation, DiagnosticReport, Procedure]), RedisModule],
    providers: [HospitalAService],
    exports: [HospitalAService],
})
export class HospitalAModule { } 