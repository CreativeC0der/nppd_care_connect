import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Condition } from 'src/conditions/entities/condition.entity';
import { MedicationRequest } from './entities/medication-request.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { Medication } from './entities/medication.entity';
import { CreateMedicationRequestDto } from './dto/create-medication-request.dto';

@Injectable()
export class MedicationsService {
    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        @InjectRepository(MedicationRequest)
        private readonly medicationRequestRepo: Repository<MedicationRequest>,
        @InjectRepository(Medication)
        private readonly medicationRepo: Repository<Medication>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Encounter)
        private readonly encounterRepo: Repository<Encounter>,
        @InjectRepository(Practitioner)
        private readonly practitionerRepo: Repository<Practitioner>,
        @InjectRepository(Condition)
        private readonly conditionRepo: Repository<Condition>,
    ) { }

    async create(dto: CreateMedicationDto): Promise<Medication> {
        const exists = await this.medicationRepo.findOneBy({ fhirId: dto.fhirId });
        if (exists) throw new BadRequestException('Medication with this FHIR ID already exists');

        const medication = this.medicationRepo.create({
            ...dto,
            batchExpirationDate: dto.batchExpirationDate ? new Date(dto.batchExpirationDate) : undefined,
        });

        return this.medicationRepo.save(medication)
    }

    async findAll(): Promise<Medication[]> {
        return this.medicationRepo.find();
    }

    async createBulk(dto: CreateMedicationRequestDto) {
        const { subjectFhirId, encounterFhirId, requesterFhirId, authoredOn, fhirId, requests, conditionFhirId } = dto;

        const patient = await this.patientRepo.findOneBy({ fhirId: subjectFhirId });
        if (!patient) throw new NotFoundException('Patient not found');

        const requester = await this.practitionerRepo.findOneBy({ fhirId: requesterFhirId });
        if (!requester) throw new NotFoundException('Practitioner not found');

        let encounter;
        if (encounterFhirId) {
            encounter = await this.encounterRepo.findOne({
                where: { fhirId: encounterFhirId, patient: { id: patient.id } },
            });
            if (!encounter) throw new NotFoundException('Encounter not found or mismatched with patient');
        }

        let condition;
        if (conditionFhirId) {
            condition = await this.conditionRepo.findOneBy({ fhirId: conditionFhirId });
            if (!condition) throw new NotFoundException('Condition not found');
        }

        const allRequests: MedicationRequest[] = [];

        for (const reqItem of requests) {
            const medication = await this.medicationRepo.findOneBy({ fhirId: reqItem.medicationFhirId });
            if (!medication) throw new NotFoundException('Medication not found');

            const newRequest = this.medicationRequestRepo.create({
                fhirId,
                intent: reqItem.intent,
                status: reqItem.status,
                priority: reqItem.priority,
                condition,
                doseInstruction: reqItem.doseInstruction,
                dosePeriod: reqItem.dosePeriod,
                authoredOn: authoredOn ? new Date(authoredOn) : new Date(),
                subject: patient,
                encounter,
                requester,
                medication, // set medication here
            });

            allRequests.push(newRequest);
        }

        return this.medicationRequestRepo.save(allRequests);
    }
}
