import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { Encounter } from './entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { PractitionersService } from 'src/practitioners/practitioners.service';

@Injectable()
export class EncountersService {

    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly http: HttpService,
        private readonly practitionerService: PractitionersService,
        @InjectRepository(Encounter) private encounterRepo: Repository<Encounter>,
        @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    ) { }

    async fetchAndSaveEncounters(patientFhirId: string) {
        const url = `${this.fhirBase}/Encounter?subject=Patient/${patientFhirId}`;
        const response = await firstValueFrom(this.http.get(url));
        const entries = response.data?.entry || [];

        console.log('Encounters fetched')

        const patient = await this.patientRepo.findOne({ where: { fhirId: patientFhirId } });
        if (!patient) throw new Error('Patient not found');

        for (const entry of entries) {
            const resource = entry?.resource;
            const existing = await this.encounterRepo.findOne({ where: { fhirId: resource.id } });
            if (existing) continue;

            const encounter = this.encounterRepo.create({
                fhirId: resource?.id || '',
                status: resource?.status || '',
                type: resource.type?.[0]?.text ?? null,
                reason: resource.reasonCode?.[0]?.coding?.[0]?.display ?? null,
                start: resource.period?.start ? new Date(resource.period.start) : null,
                end: resource.period?.end ? new Date(resource.period.end) : null,
                patient
            });

            // Get the practitioner references from the encounter
            const practitionerIds: string[] = (resource.participant || [])
                .map(participant => participant.individual?.reference?.split('/')[1])
                .filter(Boolean);

            const practitioners: Practitioner[] = [];

            for (const practitionerId of practitionerIds) {
                const practitioner = await this.practitionerService.fetchAndSavePractitioner(practitionerId);
                practitioners.push(practitioner);
            }

            encounter.practitioners = practitioners;
            await this.encounterRepo.save(encounter);
        }

        console.log('Encounters and practitioners saved');
    }
}

