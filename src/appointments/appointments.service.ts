import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Appointment } from './entities/appointment.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Slot } from '../schedules/entities/slot.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { CreateAppointmentDto } from './dto/create_appointment.dto';
import { SlotStatus } from 'src/Utils/enums/slot_status.enum';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectRepository(Appointment)
        private readonly appointmentRepo: Repository<Appointment>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Slot)
        private readonly slotRepo: Repository<Slot>,

        @InjectRepository(Practitioner)
        private readonly practitionerRepo: Repository<Practitioner>,
    ) { }

    async create(createDto: CreateAppointmentDto): Promise<Appointment> {
        const {
            fhirId,
            status,
            serviceCategory,
            specialty,
            description,
            reason,
            patientFhirId: patientId,
            practitionerFhirIds: practitionerIds = [],
            slotFhirIds: slotIds = [],
        } = createDto;

        const patient = await this.patientRepo.findOne({ where: { fhirId: patientId } });
        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        const practitionerEntities = practitionerIds.length
            ? await this.practitionerRepo.find({ where: { fhirId: In(practitionerIds) } })
            : [];

        if (practitionerIds.length !== practitionerEntities.length) {
            throw new BadRequestException('One or more practitioners not found');
        }

        const slotEntities = slotIds.length
            ? await this.slotRepo.find({ where: { fhirId: In(slotIds), status: SlotStatus.FREE } })
            : [];

        if (slotIds.length !== slotEntities.length) {
            throw new BadRequestException('One or more slots not found');
        }

        const appointment = this.appointmentRepo.create({
            fhirId,
            status,
            serviceCategory,
            specialty,
            description,
            reason,
            patient,
            participants: practitionerEntities,
        });

        const newAppointment = await this.appointmentRepo.save(appointment);

        for (const slot of slotEntities) {
            slot.appointment = newAppointment;
            slot.status = SlotStatus.BUSY
        }

        await this.slotRepo.save(slotEntities);
        return newAppointment;

    }

    // appointments.service.ts
    async getAppointmentsByPatientFhirId(fhirId: string) {
        const patient = await this.patientRepo.findOne({
            where: { fhirId },
        });

        if (!patient) {
            throw new NotFoundException(`Patient with fhirId ${fhirId} not found`);
        }

        return this.appointmentRepo.find({
            where: { patient: { id: patient.id } },
            relations: ['slots'],
            order: { createdAt: 'DESC' },
        });
    }
}