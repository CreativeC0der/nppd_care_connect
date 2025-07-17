import { Injectable, HttpException, HttpStatus, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Observation } from './entities/observation.entity';
import { CreateObservationDto } from 'src/observations/dto/create_observation.dto';
import { UpdateObservationDto } from './dto/update_observation.dto';
import { Role } from 'src/Utils/enums/role.enum';


@Injectable()
export class ObservationsService {
    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly http: HttpService,
        @InjectRepository(Observation) private readonly observationRepo: Repository<Observation>,
        @InjectRepository(Patient) private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Encounter) private readonly encounterRepo: Repository<Encounter>,
    ) { }

    async fetchAndSaveObservations(patientFhirId: string) {
        const url = `${this.fhirBase}/Observation?subject=Patient/${patientFhirId}`;

        const response = await firstValueFrom(this.http.get(url));
        const entries = response.data?.entry || [];

        const patient = await this.patientRepo.findOne({
            where: { fhirId: patientFhirId },
        });
        if (!patient)
            throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);

        const observations: Observation[] = [];

        for (const entry of entries) {
            const resource = entry.resource;

            const fhirId = resource.id;
            const existing = await this.observationRepo.find({ where: { fhirId } });

            const encounterId = resource.encounter?.reference?.split('/')?.[1];
            const encounter = encounterId
                ? await this.encounterRepo.findOne({ where: { fhirId: encounterId } })
                : null;

            // Common fields
            const baseData = {
                fhirId,
                status: resource.status ?? 'NA',
                category: resource.category?.[0]?.coding?.[0]?.display ?? 'NA',
                effectiveDateTime: resource.effectiveDateTime ?? new Date(),
                issued: resource.issued ?? new Date(),
                patient,
                encounter,
            };

            // Component-based observations (e.g., Blood Pressure)
            if (Array.isArray(resource.component)) {
                for (const comp of resource.component) {
                    const codeText = comp.code?.text ?? 'NA';
                    const value = comp.valueQuantity?.value ?? comp.valueCodeableConcept?.text ?? 'NA';
                    const unit = comp.valueQuantity?.unit ?? 'NA';

                    const newObservation = this.observationRepo.create({
                        ...baseData,
                        code: codeText,
                        value,
                        unit,
                    });

                    // Optional: Check for matching existing observation
                    const match = existing?.find((obs) => obs.code === codeText);
                    if (match)
                        newObservation.id = match.id; // This will trigger an update

                    observations.push(newObservation);
                }
            } else {
                const codeText = resource.code?.text ?? 'NA';
                const value = resource.valueQuantity?.value ?? resource.valueCodeableConcept?.text ?? 'NA';
                const unit = resource.valueQuantity?.unit ?? 'NA';

                const newObservation = this.observationRepo.create({
                    ...baseData,
                    code: codeText,
                    value,
                    unit,
                });

                const match = existing?.find((obs) => obs.code === codeText);
                if (match)
                    newObservation.id = match.id;

                observations.push(newObservation);
            }

        }

        // Single DB call
        return this.observationRepo.save(observations);
    }

    async createObservations(
        dto: CreateObservationDto,
        request: any,
    ): Promise<Observation[]> {
        const { subjectFhirId, encounterFhirId, issued, observations } = dto;

        // Restrict patient role to only their own observations
        if (
            request.user.role === Role.PATIENT &&
            request.user.fhirId !== subjectFhirId
        ) {
            throw new UnauthorizedException(
                'You are not authorized to create observations for this patient',
            );
        }

        // Fetch and validate patient
        const patient = await this.patientRepo.findOneBy({ fhirId: subjectFhirId });
        if (!patient) throw new BadRequestException('Patient not found');

        // Fetch and validate encounter if provided
        let encounter: Encounter | null;
        if (encounterFhirId) {
            encounter = await this.encounterRepo.findOne({
                where: {
                    fhirId: encounterFhirId,
                    patient: { id: patient.id },
                },
            });
            if (!encounter) throw new BadRequestException('Encounter not found');
        }

        // Map each observation
        const newObservations = observations.map((obsDto) =>
            this.observationRepo.create({
                ...obsDto,
                issued,
                patient,
                encounter,
            }),
        );

        // Save all observations at once
        return this.observationRepo.save(newObservations);
    }

    async updateObservation(fhirId: string, updateDto: UpdateObservationDto, request: any): Promise<Observation> {

        const observation = await this.observationRepo.findOne({
            where: { fhirId },
            relations: ['patient', 'encounter'],
        });

        if (!observation)
            throw new NotFoundException(`Observation with id ${fhirId} not found`);

        // Check authorization if patient is not allowed to create observation for another patient
        if (request.user.role == Role.PATIENT && request.user.fhirId != observation.patient.fhirId)
            throw new UnauthorizedException(`You are not authorized to update observation for this patient`);

        // Merge the existing observation with updateDto
        const updated = this.observationRepo.merge(observation, updateDto);

        return this.observationRepo.save(updated);
    }

    async getByEncounterFhirId(encounterFhirId: string): Promise<Observation[]> {
        const encounter = await this.encounterRepo.findOne({
            where: { fhirId: encounterFhirId },
        });

        if (!encounter) {
            throw new NotFoundException('Encounter not found');
        }

        return this.observationRepo.find({
            where: { encounter: { id: encounter.id } },
            order: { effectiveDateTime: 'DESC' },
        });
    }
}
