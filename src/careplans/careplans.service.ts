import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Patient } from 'src/patients/entities/patient.entity';
import { In, Repository } from 'typeorm';
import { CarePlanActivity } from './entities/careplan-activity.entity';
import { CarePlan } from './entities/careplan.entity';
import { log } from 'console';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import { CreateCareplanDto } from './dto/create_cp.dto';
import Redis from 'ioredis';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateCareplanDto } from './dto/update_cp.dto';

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
        private readonly conditionRepo: Repository<Condition>,
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis
    ) { }

    async fetchAndSaveCarePlans(patientFhirId: string) {
        const carePlanUrl = `${this.fhirBase}/CarePlan?subject=Patient/${patientFhirId}`;
        const res = await firstValueFrom(this.httpService.get(carePlanUrl));
        const entries = res.data?.entry || [];

        console.log('Care Plans fetched. Found', entries.length, 'care plans')

        const patient = await this.patientRepo.findOne({ where: { fhirId: patientFhirId } });
        if (!patient) throw new NotFoundException(`Patient with FHIR ID ${patientFhirId} not found.`);

        for (const entry of entries) {
            const cp = entry.resource ?? {};
            const encounterId = cp.encounter?.reference?.split('/')?.[1]

            const encounter = await this.encounterRepo.findOne({ where: { fhirId: encounterId } });
            const existing = await this.carePlanRepo.findOne({ where: { fhirId: cp.id } });

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
            carePlan.activities = [] // delete all activities if present

            if (existing)
                carePlan.id = existing.id

            // Save the care plan
            const newCarePlan = await this.carePlanRepo.save(carePlan);

            // Save the activities
            const activities = cp.activity?.map(act => {
                const detail = act.detail || {};
                return this.activityRepo.create({
                    carePlan: newCarePlan,
                    detailText: detail.code?.text || '',
                    status: detail.status || null,
                });
            });

            await this.activityRepo.save(activities);
            this.updateRedisCache(newCarePlan.fhirId);
        }

        console.log('Care plans and activities saved.')
    }

    async createCarePlan(createCareplanDto: CreateCareplanDto): Promise<CarePlan> {
        const { patientFhirId, encounterFhirId, conditionFhirIds, activities, ...carePlanData } = createCareplanDto;

        const patient = await this.patientRepo.findOne({ where: { fhirId: patientFhirId } });
        if (!patient)
            throw new NotFoundException(`Patient with ID ${patientFhirId} not found`);

        const encounter = encounterFhirId ? await this.encounterRepo.findOne({ where: { fhirId: encounterFhirId } }) : null;
        const conditions = conditionFhirIds ? await this.conditionRepo.find({ where: { fhirId: In(conditionFhirIds) } }) : [];

        const carePlan = this.carePlanRepo.create({
            ...carePlanData,
            patient,
            encounter,
            conditions,
        });

        const savedCarePlan = await this.carePlanRepo.save(carePlan);

        const carePlanActivities = activities.map(activityDto =>
            this.activityRepo.create({ ...activityDto, carePlan: savedCarePlan }),
        );
        await this.activityRepo.save(carePlanActivities);
        this.updateRedisCache(savedCarePlan.fhirId);
        return savedCarePlan;
    }


    async getByPatientFhirId(fhirId: string) {
        const patient = await this.patientRepo.findOne({
            where: { fhirId },
        });

        if (!patient) throw new NotFoundException('Patient not found');

        return this.carePlanRepo.find({
            where: {
                patient: { id: patient.id }
            },
            relations: ['activities', 'conditions'],
        });
    }

    async updateRedisCache(carePlanId: string) {
        const carePlan = await this.carePlanRepo.findOne({
            where: { fhirId: carePlanId },
            relations: ['activities', 'patient']
        });

        if (!carePlan)
            throw new NotFoundException('CarePlan not found');

        const redisKey = 'care-plan-notifications'
        const redisCarePlanData = JSON.parse(await this.redisClient.get(redisKey) ?? '{}');

        if (carePlan.status === 'active')
            redisCarePlanData[carePlanId] = { ...carePlan }
        else
            delete redisCarePlanData[carePlanId];

        await this.redisClient.set(redisKey, JSON.stringify(redisCarePlanData));
        console.log('Redis cache updated for care plan notifications')
    }
    async updateCarePlan(fhirId: string, updateDto: UpdateCareplanDto) {
        const existing = await this.carePlanRepo.findOne({
            where: { fhirId },
            relations: ['patient', 'encounter', 'conditions', 'activities'],
        });

        if (!existing) throw new NotFoundException(`CarePlan with FHIR ID ${fhirId} not found`);

        const {
            patientFhirId,
            encounterFhirId,
            conditionFhirIds,
            activities,
            ...carePlanData
        } = updateDto;

        // Update patient if provided
        if (patientFhirId) {
            const patient = await this.patientRepo.findOne({ where: { fhirId: patientFhirId } });
            if (!patient) throw new NotFoundException(`Patient with ID ${patientFhirId} not found`);
            existing.patient = patient;
        }

        // Update encounter if provided
        if (encounterFhirId) {
            const encounter = await this.encounterRepo.findOne({ where: { fhirId: encounterFhirId } });
            if (!encounter) throw new NotFoundException(`Encounter with ID ${encounterFhirId} not found`);
            existing.encounter = encounter;
        }

        // Update conditions if provided
        if (conditionFhirIds) {
            const conditions = await this.conditionRepo.find({ where: { fhirId: In(conditionFhirIds) } });
            existing.conditions = conditions;
        }

        // Update basic fields
        Object.assign(existing, carePlanData);

        // Save updated care plan
        const savedCarePlan = await this.carePlanRepo.save(existing);

        // Replace activities if provided
        if (activities) {
            await this.activityRepo.delete({ carePlan: { id: savedCarePlan.id } }); // delete old
            const newActivities = activities.map(dto =>
                this.activityRepo.create({ ...dto, carePlan: savedCarePlan }),
            );
            await this.activityRepo.save(newActivities);
        }

        // Update cache
        this.updateRedisCache(savedCarePlan.fhirId);

        return savedCarePlan;
    }


}

