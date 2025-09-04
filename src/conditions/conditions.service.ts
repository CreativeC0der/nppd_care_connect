import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { Condition } from './entities/condition.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { CreateConditionDto } from './dto/create-conditions.dto';
import { Organization } from 'src/organizations/entities/organization.entity';
import { PatientsService } from 'src/patients/patients.service';


@Injectable()
export class ConditionsService {
    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        @InjectRepository(Condition)
        private readonly conditionRepo: Repository<Condition>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Encounter)
        private readonly encounterRepo: Repository<Encounter>,
        @InjectRepository(Organization)
        private readonly organizationRepo: Repository<Organization>,
        private patientsService: PatientsService,
    ) { }

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

    async getConditionCountsLastTwoMonths(organizationFhirId: string, practitionerId?: string | null): Promise<any[]> {
        // First validate that the organization exists
        const organization = await this.organizationRepo.findOne({ where: { fhirId: organizationFhirId } });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }
        // Create the tablefunc extension if it doesn't exist
        await this.conditionRepo.query(`CREATE EXTENSION IF NOT EXISTS tablefunc;`);

        // Get distinct condition codes for the last 2 months
        const conditionQuery = `--sql
            SELECT DISTINCT c.code 
            FROM conditions c
            INNER JOIN encounters enc ON c."encounterId" = enc.id
            INNER JOIN organization sp ON enc."serviceProvider" = sp.id
            INNER JOIN encounter_practitioners ep ON enc.id = ep.encounter_id
            WHERE sp."managing_organization" = '${organization.id}'
                AND c."recordedDate" >= CURRENT_DATE - INTERVAL '2 months'
                AND c.code IS NOT NULL
                AND ep.practitioner_id = '${practitionerId}'
            ORDER BY c.code
        `;

        const conditions = await this.conditionRepo.query(conditionQuery);

        if (conditions.length === 0) {
            return [];
        }

        // Build column definitions for the crosstab
        const columnDefs = conditions
            .map(c => `"${c.code}" int`)
            .join(', ');

        // Build COALESCE expressions for each condition column
        const coalesceColumns = conditions
            .map(c => `COALESCE("${c.code}", 0) AS "${c.code}"`)
            .join(', ');

        // Build the crosstab query
        const query = `--sql
            SELECT *
            FROM crosstab(
                $$ 
                    SELECT
                        TO_CHAR(c."recordedDate", 'YYYY-MM') AS month,
                        c.code,
                        COUNT(*) AS cnt
                    FROM conditions c
                    LEFT JOIN encounters enc ON c."encounterId" = enc.id
                    LEFT JOIN organization sp ON enc."serviceProvider" = sp.id
                    LEFT JOIN encounter_practitioners ep ON enc.id = ep.encounter_id
                    WHERE sp."managing_organization" = '${organization.id}'
                        AND c."recordedDate" >= CURRENT_DATE - INTERVAL '2 months'
                        AND c.code IS NOT NULL
                        AND ep.practitioner_id = '${practitionerId}'
                    GROUP BY month, c.code 
                    ORDER BY month DESC, c.code
                $$,
                $$ 
                    ${conditionQuery}
                $$
            ) AS pivot_table(
                "month" text,
                ${columnDefs}
            )
            ORDER BY month DESC
        `;

        // Execute the query to get condition counts for the last 2 months
        const result = await this.conditionRepo.query(query);
        return result;
    }

    async getAll(organizationFhirId: string, practitionerId?: string): Promise<Condition[]> {
        let practitionerPatients: Patient[] | undefined;

        if (practitionerId) {
            practitionerPatients = await this.patientsService.getPatientsByPractitioner(organizationFhirId, practitionerId);
        }

        return this.conditionRepo.find({
            where: {
                encounter: {
                    serviceProvider: {
                        managingOrganization: {
                            fhirId: organizationFhirId
                        }
                    },
                    ...(practitionerId ? {
                        patient: {
                            id: In(practitionerPatients?.map(patient => patient.id) ?? [])
                        }
                    } : {})
                }
            },
            select: {
                subject: {
                    id: true,
                    fhirId: true,
                    firstName: true,
                    lastName: true,
                }
            },
            relations: ['subject']
        });
    }
}
