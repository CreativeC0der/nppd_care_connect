import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Slot } from '../schedules/entities/slot.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Schedule, Practitioner, Patient, Slot, Organization])],

  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule { }
