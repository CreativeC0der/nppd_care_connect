import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

import { Medication } from './entities/medication.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';

@Injectable()
export class MedicationsService {
    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly http: HttpService,
        @InjectRepository(Medication)
        private readonly medRepo: Repository<Medication>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Encounter)
        private readonly encounterRepo: Repository<Encounter>,
        @InjectRepository(Practitioner)
        private readonly practitionerRepo: Repository<Practitioner>,
    ) { }

    async fetchAndSaveMedications(patientFhirId: string) {
        const url = `${this.fhirBase}/MedicationRequest?patient=Patient/${patientFhirId}`;
        const response = await firstValueFrom(this.http.get(url));
        const entries = response.data?.entry || [];

        const patient = await this.patientRepo.findOne({ where: { fhirId: patientFhirId } });
        if (!patient) throw new Error('Patient not found');

        for (const entry of entries) {
            const med = entry.resource;
            const existing = await this.medRepo.findOne({ where: { fhirId: med.id } });

            let medication = this.medRepo.create({
                fhirId: med.id,
                status: med.status,
                intent: med.intent,
                display: med.medicationCodeableConcept?.text || null,
                authoredOn: med.authoredOn ? new Date(med.authoredOn) : null,
                patient: patient,
            });

            // Link encounter (optional)
            const encounterId = med.encounter?.reference?.split('/')?.[1];
            if (encounterId) {
                const encounter = await this.encounterRepo.findOne({ where: { fhirId: encounterId } });
                if (encounter) medication.encounter = encounter;
            }

            // Link practitioner (optional)
            const practitionerId = med.requester?.reference?.split('/')?.[1];
            if (practitionerId) {
                const practitioner = await this.practitionerRepo.findOne({ where: { fhirId: practitionerId } });
                if (practitioner) medication.practitioner = practitioner;
            }

            if (existing)
                medication.id = existing.id

            await this.medRepo.save(medication);
        }

        console.log('Medications saved successfully');
    }
}
