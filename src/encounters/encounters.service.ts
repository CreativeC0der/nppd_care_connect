import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Encounter, EncounterStatus, EncounterClass } from './entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { PractitionersService } from 'src/practitioners/practitioners.service';
import { CreateEncounterDto } from './dto/create_encounter.dto';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { UpdateEncounterDto } from './dto/update_encounter.dto';
import { Organization } from 'src/organizations/entities/organization.entity';

@Injectable()
export class EncountersService {

    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly http: HttpService,
        private readonly practitionerService: PractitionersService,
        @InjectRepository(Encounter) private encounterRepo: Repository<Encounter>,
        @InjectRepository(Patient) private patientRepo: Repository<Patient>,
        @InjectRepository(Practitioner) private practitionerRepo: Repository<Practitioner>,
        @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
        @InjectRepository(Organization) private organizationRepo: Repository<Organization>,
    ) { }

    async createEncounter(dto: CreateEncounterDto, request: any): Promise<Encounter> {
        const { patientFhirId, practitionerFhirIds, appointmentFhirId, ...encounterDto } = dto;

        // 1. Validate patient
        const patient = await this.patientRepo.findOne({ where: { fhirId: patientFhirId } });
        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        // Appointment validate
        const appointment = await this.appointmentRepo.findOne({ where: { fhirId: appointmentFhirId } });
        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        // 2. Fetch all requested practitioners
        const practitioners = await this.practitionerRepo.find({
            where: { fhirId: In(practitionerFhirIds) },
        });

        if (practitioners.length !== practitionerFhirIds.length) {
            throw new BadRequestException('Some practitioners were not found');
        }

        // 4. Create the new encounter
        const encounter = this.encounterRepo.create({
            ...encounterDto,
            patient,
            practitioners,
            appointment
        });

        return this.encounterRepo.save(encounter);
    }

    async getByPatientFhirId(patientFhirId: string, organizationFhirId: string): Promise<Encounter[]> {
        const patient = await this.patientRepo.findOne({
            where: { fhirId: patientFhirId },
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        const organization = await this.organizationRepo.findOne({
            where: { fhirId: organizationFhirId }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        return this.encounterRepo.find({
            where: {
                patient: { id: patient.id },
                serviceProvider: {
                    managingOrganization: {
                        id: organization.id
                    }
                }
            },
            relations: [
                'practitioners',
                'conditions',
                'medications',
                'medications.medication',
                'procedures',
                'diagnosticReports',
                'diagnosticReports.results',
            ],
            order: { start: 'DESC' },
        });
    }


    async updateByFhirId(
        fhirId: string,
        dto: UpdateEncounterDto,
    ): Promise<Encounter> {
        const encounter = await this.encounterRepo.findOne({ where: { fhirId } });
        if (!encounter) throw new NotFoundException('Encounter not found');

        const updatedEncounter = this.encounterRepo.merge(encounter, dto);
        return this.encounterRepo.save(updatedEncounter);
    }

    async getEncountersByOrganization(organizationFhirId: string): Promise<Encounter[]> {
        const organization = await this.organizationRepo.findOne({
            where: { fhirId: organizationFhirId }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        const encounters = await this.encounterRepo.find({
            where: {
                serviceProvider: {
                    managingOrganization: {
                        id: organization.id
                    }
                }
            },
            order: { start: 'DESC' },
        });

        return encounters;
    }

    async getEncountersGroupedByClass(organizationFhirId: string) {
        // Use TypeORM's query builder to get grouped data
        const result = await this.encounterRepo
            .createQueryBuilder('encounter')
            .select('encounter.class', 'class')
            .addSelect('COUNT(encounter.id)', 'count')
            .innerJoin('encounter.serviceProvider', 'serviceProvider')
            .innerJoin('serviceProvider.managingOrganization', 'managingOrganization')
            .groupBy('encounter.class')
            .where('managingOrganization.fhirId = :organizationFhirId', { organizationFhirId })
            .getRawMany();

        // Transform the result to match the expected format
        return result.map(item => ({
            class: item.class || 'UNKNOWN',
            count: parseInt(item.count)
        }));
    }

    async getEncountersGroupedByType(organizationFhirId: string) {
        // Use TypeORM's query builder to get grouped data by 'type'
        const result = await this.encounterRepo
            .createQueryBuilder('encounter')
            .select('encounter.type', 'type')
            .addSelect('COUNT(encounter.id)', 'count')
            .innerJoin('encounter.serviceProvider', 'serviceProvider')
            .innerJoin('serviceProvider.managingOrganization', 'managingOrganization')
            .groupBy('encounter.type')
            .where('managingOrganization.fhirId = :organizationFhirId', { organizationFhirId })
            .getRawMany();

        // Transform the result to match the expected format
        return result.map(item => ({
            type: item.type || 'UNKNOWN',
            count: parseInt(item.count)
        }));
    }

    async getPractitionersWithEncounterCounts(organizationFhirId: string) {
        // First validate that the organization exists
        const organization = await this.organizationRepo.findOne({
            where: { fhirId: organizationFhirId }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        // Execute the query to get practitioners with encounter counts
        const encounterCounts = await this.encounterRepo
            .createQueryBuilder('encounter')
            .innerJoin('encounter.serviceProvider', 'serviceProvider')
            .innerJoin('serviceProvider.managingOrganization', 'managingOrganization')
            .innerJoin('encounter.practitioners', 'practitioner')
            .select('practitioner.fhirId', 'practitionerFhirId')
            .addSelect('COUNT(encounter.id)', 'encounterCount')
            .where('managingOrganization.fhirId = :fhirId', { fhirId: organizationFhirId })
            .groupBy('practitioner.fhirId')
            .orderBy('"encounterCount"', 'DESC')
            .getRawMany();

        // Transform the result to include practitioner details
        const practitionersWithCounts = await Promise.all(
            encounterCounts.map(async (item) => {
                const practitioner = await this.practitionerRepo.findOne({
                    where: { fhirId: item.practitionerFhirId }
                });

                return {
                    practitionerFhirId: item.practitionerFhirId,
                    encounterCount: parseInt(item.encounterCount),
                    practitioner: practitioner || null
                };
            })
        );

        return practitionersWithCounts;
    }

    async getAverageLengthOfStay(organizationFhirId: string) {
        // First validate that the organization exists
        const organization = await this.organizationRepo.findOne({
            where: { fhirId: organizationFhirId }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        // Get all discharged inpatient encounters for the organization
        const result = await this.encounterRepo
            .createQueryBuilder('encounter')
            .innerJoin('encounter.serviceProvider', 'serviceProvider')
            .innerJoin('serviceProvider.managingOrganization', 'managingOrganization')
            .where('managingOrganization.fhirId = :organizationFhirId', { organizationFhirId })
            .andWhere('encounter.status = :status', { status: EncounterStatus.DISCHARGED })
            .andWhere('encounter.class = :class', { class: EncounterClass.INPATIENT })
            .andWhere('encounter.start IS NOT NULL')
            .andWhere('encounter.end IS NOT NULL')
            .andWhere('encounter.end > encounter.start')
            .select('AVG(EXTRACT(EPOCH FROM (encounter.end - encounter.start)) / 86400)', 'averageLengthOfStay')
            .addSelect('COUNT(encounter.id)', 'totalEncounters')
            .getRawOne();

        if (!result || result.totalEncounters === '0') {
            return {
                averageLengthOfStay: 0,
                totalEncounters: 0,
                unit: 'days'
            };
        }

        return {
            averageLengthOfStay: Math.round(parseFloat(result.averageLengthOfStay) * 100) / 100,
            totalEncounters: parseInt(result.totalEncounters),
            unit: 'days'
        };
    }

    async getYearwiseEncounterClassCounts(organizationFhirId: string): Promise<any[]> {
        // First validate that the organization exists
        const organization = await this.organizationRepo.findOne({
            where: { fhirId: organizationFhirId }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        await this.encounterRepo.query(`CREATE EXTENSION IF NOT EXISTS tablefunc;`);

        const classQuery = `SELECT DISTINCT class FROM encounters ORDER BY class`;

        const classes = await this.encounterRepo.query(classQuery);

        const columnDefs = classes
            .map(c => `"${c.class}" int`)
            .join(', ');

        // Build COALESCE expressions for each class column
        const coalesceColumns = classes
            .map(c => `COALESCE("${c.class}", 0) AS "${EncounterClass[c.class]}"`)
            .join(', ');

        const query = `
                        SELECT year, ${coalesceColumns}
                        FROM crosstab(
                            $$ 
                                SELECT
                                    EXTRACT(YEAR FROM "start")::int AS year,
                                    class,
                                    COUNT(*) AS cnt
                                FROM encounters
                                INNER JOIN organization AS "serviceProvider" ON encounters."serviceProvider" = "serviceProvider".id
                                WHERE "serviceProvider"."managing_organization" = '${organization.id}'
                                GROUP BY year, class 
                                ORDER BY year, class
                            $$,
                            $$ 
                                ${classQuery} 
                            $$
                        ) AS pivot_table(
                            "year" int,
                            ${columnDefs}
                        );`

        // Execute the query to get yearwise encounter class counts
        const result = await this.encounterRepo.query(query);
        return result;

    }

    async getServiceProviderLoadPercentage(organizationFhirId: string): Promise<any[]> {
        // First validate that the organization exists
        const organization = await this.organizationRepo.findOne({
            where: { fhirId: organizationFhirId }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        // Get encounter counts grouped by serviceProvider
        const result = await this.encounterRepo
            .createQueryBuilder('encounter')
            .innerJoin('encounter.serviceProvider', 'serviceProvider')
            .select('serviceProvider.name', 'department')
            .addSelect('COUNT(encounter.id)', 'count')
            .where('serviceProvider.managingOrganization = :organizationId', { organizationId: organization.id })
            .groupBy('serviceProvider.name')
            .orderBy('count', 'DESC')
            .getRawMany();

        // Calculate load percentage based on max count of 20
        const maxCount = 20;
        return result.map(item => ({
            department: item.department || 'Unknown',
            load: Math.round((parseInt(item.count) / maxCount) * 100)
        }));
    }
}

