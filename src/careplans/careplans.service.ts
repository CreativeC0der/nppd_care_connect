import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Patient } from 'src/patients/entities/patient.entity';
import { Repository } from 'typeorm';
import { CarePlanActivity } from './entities/careplan-activity.entity';
import { CarePlan } from './entities/careplan.entity';
import { log } from 'console';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Condition } from 'src/conditions/entities/condition.entity';

@Injectable()
export class CareplanService {
    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(CarePlan)
        private readonly carePlanRepo: Repository<CarePlan>,
        @InjectRepository(CarePlanActivity)
        private readonly activityRepo: Repository<CarePlanActivity>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Encounter)
        private readonly encounterRepo: Repository<Encounter>,
        @InjectRepository(Condition)
        private readonly conditionRepo: Repository<Condition>
    ) { }

    async fetchAndSaveCarePlans(patientFhirId: string) {
        const carePlanUrl = `${this.fhirBase}/CarePlan?subject=Patient/${patientFhirId}`;
        const res = await firstValueFrom(this.httpService.get(carePlanUrl));
        const entries = res.data?.entry || [];

        console.log('Care Plans fetched. Found', entries.length, 'care plans')

        const patient = await this.patientRepo.findOne({ where: { fhirId: patientFhirId } });
        if (!patient) throw new NotFoundException(`Patient with FHIR ID ${patientFhirId} not found.`);

        for (const entry of entries) {
            const cp = entry.resource;
            const encounterId = cp.encounter?.reference?.split('/')?.[1]

            const existing = await this.carePlanRepo.findOne({ where: { fhirId: cp.id } });
            if (existing) continue; // Skip if already exists

            const encounter = await this.encounterRepo.findOne({ where: { fhirId: encounterId } });

            const carePlan = this.carePlanRepo.create({
                fhirId: cp.id,
                status: cp.status,
                intent: cp.intent,
                category: cp.category?.[0]?.text || null,
                startDate: cp.period?.start ? new Date(cp.period.start) : null,
                endDate: cp.period?.end ? new Date(cp.period.end) : null,
                patient: patient,
                encounter: encounter,
            });

            // care plan links to conditions
            const conditionFhirIds = cp.addresses
                ?.map(addr => addr.reference?.split('/')?.[1])
                ?.filter(Boolean);

            const conditions = await this.conditionRepo.find({
                where: conditionFhirIds?.map(fhirId => ({ fhirId })),
            });

            carePlan.conditions = conditions;

            // Save the care plan
            const newCarePlan = await this.carePlanRepo.save(carePlan);

            // Save the activities
            const activities = (cp.activity || []).map(act => {
                const detail = act.detail || {};
                return this.activityRepo.create({
                    carePlan: newCarePlan,
                    detailText: detail.code?.text || '',
                    status: detail.status || null,
                });
            });

            await this.activityRepo.save(activities);
        }

        console.log('Care plans and activities saved.')
    }
}
