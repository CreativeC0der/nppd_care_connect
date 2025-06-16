import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Observation } from './entities/observation.entity';
import { CreateObservationDto } from 'src/conditions/dto/create_observation.dto';


@Injectable()
export class ObservationsService {
    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly http: HttpService,
        @InjectRepository(Observation) private readonly observationRepo: Repository<Observation>,
        @InjectRepository(Patient) private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Encounter) private readonly encounterRepo: Repository<Encounter>,
    ) { }

    async fetchAndSaveObservations(patientFhirId: string): Promise<void> {
        const url = `${this.fhirBase}/Observation?subject=Patient/${patientFhirId}`;

        const response = await firstValueFrom(this.http.get(url));
        const entries = response.data?.entry || [];

        const patient = await this.patientRepo.findOne({
            where: { fhirId: patientFhirId },
        });

        if (!patient) {
            throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
        }

        for (const entry of entries) {
            const resource = entry.resource;

            const fhirId = resource.id;
            const existing = await this.observationRepo.findOne({ where: { fhirId } });
            if (existing) continue;

            const encounterId = resource.encounter?.reference?.split('/')?.[1];
            const encounter = encounterId
                ? await this.encounterRepo.findOne({ where: { fhirId: encounterId } })
                : null;

            const obs = this.observationRepo.create({
                fhirId,
                status: resource.status,
                category: resource.category?.[0]?.coding?.[0]?.display,
                code: resource.code?.coding?.text,
                effectiveDateTime: resource.effectiveDateTime,
                issued: resource.issued,
                value: resource.valueQuantity?.value,
                unit: resource.valueQuantity?.unit,
                patient,
                encounter,
            });

            await this.observationRepo.save(obs);
        }
    }
    async createObservation(dto: CreateObservationDto): Promise<Observation> {
        const { patientFhirId, encounterFhirId, ...observationData } = dto

        const newObservation = this.observationRepo.create({
            ...observationData
        });

        // Link patient
        const patient = await this.patientRepo.findOneBy({ fhirId: patientFhirId });
        if (!patient) throw new Error('Patient not found');

        newObservation.patient = patient;

        // Link encounter (optional)
        if (encounterFhirId) {
            const encounter = await this.encounterRepo.findOneBy({ id: dto.encounterFhirId });
            if (!encounter)
                throw new Error('Encounter not found');
            newObservation.encounter = encounter;
        }

        return this.observationRepo.save(newObservation);
    }
}
