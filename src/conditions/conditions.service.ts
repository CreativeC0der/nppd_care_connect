import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { Condition } from './entities/condition.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { CreateConditionDto } from './dto/create-conditions.dto';


@Injectable()
export class ConditionsService {
    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly http: HttpService,
        @InjectRepository(Condition)
        private readonly conditionRepo: Repository<Condition>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Encounter)
        private readonly encounterRepo: Repository<Encounter>,
    ) { }

    async fetchAndSaveConditions(patientFhirId: string) {
        const url = `${this.fhirBase}/Condition?subject=Patient/${patientFhirId}`;
        const response = await firstValueFrom(this.http.get(url));
        const entries = response.data?.entry || [];

        const patient = await this.patientRepo.findOne({ where: { fhirId: patientFhirId } });
        if (!patient) throw new Error('Patient not found');

        for (const entry of entries) {
            const cond = entry?.resource;
            const existing = await this.conditionRepo.findOne({ where: { fhirId: cond.id } });

            let condition = this.conditionRepo.create({
                fhirId: cond.id,
                clinicalStatus: cond.clinicalStatus?.coding?.[0]?.code || null,
                verificationStatus: cond.verificationStatus?.coding?.[0]?.code || null,
                code: cond.code?.text || null,
                recordedDate: cond.recordedDate ? new Date(cond.recordedDate) : null,
                subject: patient,
            });

            // Link encounter if present
            const encounterRef = cond.encounter?.reference;
            if (encounterRef) {
                const encounterFhirId = encounterRef.split('/')[1];
                const encounter = await this.encounterRepo.findOne({ where: { fhirId: encounterFhirId } });
                if (encounter) {
                    condition.encounter = encounter;
                }
            }

            if (existing)
                condition.id = existing.id

            await this.conditionRepo.save(condition);
        }

        console.log('Conditions saved successfully')
    }

    async bulkCreate(dto: CreateConditionDto): Promise<Condition[]> {
        const patient = await this.patientRepo.findOneBy({ fhirId: dto.subjectFhirId });
        if (!patient) throw new NotFoundException('Patient not found');

        const encounter = await this.encounterRepo.findOne({
            where: {
                fhirId: dto.encounterFhirId,
                patient: { id: patient.id },
            },
        });
        if (!encounter) throw new NotFoundException('Encounter not found for patient');

        const newConditions = dto.conditions.map((cond) =>
            this.conditionRepo.create({
                ...cond,
                subject: patient,
                encounter: encounter,
            }),
        );

        return this.conditionRepo.save(newConditions);
    }
}
