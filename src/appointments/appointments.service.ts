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
import { Organization } from 'src/organizations/entities/organization.entity';

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
        @InjectRepository(Organization)
        private readonly organizationRepo: Repository<Organization>,
    ) { }

    async create(createDto: CreateAppointmentDto): Promise<Appointment> {
        const {
            fhirId,
            status,
            serviceCategory,
            specialty,
            description,
            reason,
            start,
            end,
            patientFhirId: patientId,
            practitionerFhirIds: practitionerIds = [],
            slotFhirIds: slotIds = [],
            organizationFhirId,
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

        const organization = await this.organizationRepo.findOne({ where: { fhirId: organizationFhirId } });
        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        const appointment = this.appointmentRepo.create({
            fhirId,
            status,
            serviceCategory,
            specialty,
            description,
            reason,
            start: new Date(start),
            end: new Date(end),
            patient,
            participants: practitionerEntities,
            serviceProvider: organization,
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

    async getAppointmentRatesByMonth(organizationFhirId: string, practitionerId?: string): Promise<any[]> {

        const organization = await this.organizationRepo.findOne({ where: { fhirId: organizationFhirId } });
        if (!organization) {
            throw new NotFoundException(`Organization with fhirId ${organizationFhirId} not found`);
        }

        const query = `--sql
            WITH appointment_counts AS (
                SELECT 
                    EXTRACT(YEAR FROM appt.start) as year,
                    EXTRACT(MONTH FROM appt.start) as month,
                    COUNT(*) as total_appointments,
                    SUM(CASE WHEN appt.status = 'noshow' THEN 1 ELSE 0 END) as noshow_count,
                    SUM(CASE WHEN appt.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
                FROM appointment appt
                INNER JOIN organization o ON appt."serviceProvider" = o.id
                INNER JOIN appointment_participants appt_part ON appt.id = appt_part."appointmentId"
                WHERE o."managing_organization" = $1
                AND appt_part."practitionersId" = COALESCE($2, appt_part."practitionersId")
                AND appt.start IS NOT NULL
                GROUP BY EXTRACT(YEAR FROM appt.start), EXTRACT(MONTH FROM appt.start)
            )
            SELECT 
                format('%s-%s', year, month) as date,
                CASE 
                    WHEN total_appointments > 0 THEN 
                        ROUND((noshow_count::DECIMAL / total_appointments::DECIMAL) * 100, 2)
                    ELSE 0 
                END as noshow_rate,
                CASE 
                    WHEN total_appointments > 0 THEN 
                        ROUND((cancelled_count::DECIMAL / total_appointments::DECIMAL) * 100, 2)
                    ELSE 0 
                END as cancellation_rate
            FROM appointment_counts
            ORDER BY year ASC, month ASC
        `;

        const result = await this.appointmentRepo.query(query, [organization.id, practitionerId ?? null]);
        return result;
    }

    async findAll(organizationFhirId: string, practitionerId?: string): Promise<Appointment[]> {
        const organization = await this.organizationRepo.findOne({ where: { fhirId: organizationFhirId } });
        if (!organization) {
            throw new NotFoundException(`Organization with fhirId ${organizationFhirId} not found`);
        }

        return this.appointmentRepo.find({
            where: {
                serviceProvider: {
                    managingOrganization: {
                        fhirId: organizationFhirId
                    }
                },
                participants: {
                    id: practitionerId
                }
            },
            relations: ['patient', 'participants', 'serviceProvider', 'slots'],
            order: { start: 'DESC' }
        })
    }
}