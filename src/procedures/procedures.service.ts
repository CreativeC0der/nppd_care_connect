import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Procedure } from './entities/procedure.entity';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Role } from 'src/Utils/enums/role.enum';
import { Organization } from 'src/organizations/entities/organization.entity';

@Injectable()
export class ProceduresService {
    constructor(
        @InjectRepository(Procedure)
        private proceduresRepository: Repository<Procedure>,
        @InjectRepository(Patient)
        private patientsRepository: Repository<Patient>,
        @InjectRepository(Encounter)
        private encountersRepository: Repository<Encounter>,
        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,
    ) { }

    async create(createProcedureDto: CreateProcedureDto): Promise<Procedure> {
        const { subjectId, encounterId, ...procedureData } = createProcedureDto;

        // Find the patient
        const patient = await this.patientsRepository.findOne({ where: { id: subjectId } });
        if (!patient) {
            throw new NotFoundException(`Patient with ID ${subjectId} not found`);
        }

        // Find the encounter if provided
        let encounter: Encounter | null = null;
        if (encounterId) {
            encounter = await this.encountersRepository.findOne({ where: { id: encounterId } });
            if (!encounter) {
                throw new NotFoundException(`Encounter with ID ${encounterId} not found`);
            }
        }

        const procedure = this.proceduresRepository.create({
            ...procedureData,
            subject: patient,
            encounter: encounter,
        });

        return this.proceduresRepository.save(procedure);
    }

    async findAll(organizationFhirId: string, practitionerId?: string): Promise<Procedure[]> {
        return this.proceduresRepository.find({
            where: {
                encounter: {
                    serviceProvider: {
                        managingOrganization: {
                            fhirId: organizationFhirId
                        }
                    },
                    practitioners: {
                        id: practitionerId ?? undefined
                    }
                }
            }
        });
    }

    async findByFhirId(fhirId: string): Promise<Procedure> {
        const procedure = await this.proceduresRepository.findOne({
            where: { fhirId },
            relations: ['subject', 'encounter', 'reason'],
        });

        if (!procedure) {
            throw new NotFoundException(`Procedure with FHIR ID ${fhirId} not found`);
        }

        return procedure;
    }

    async getProcedureAndReportCountsByYear(organizationFhirId: string): Promise<any[]> {
        const query = `--sql
            WITH procedure_counts AS (
                SELECT 
                    EXTRACT(YEAR FROM "p"."occurrenceStart") as year,
                    COUNT(*) as procedure_count
                FROM procedures p
                INNER JOIN encounters e ON "p"."encounter_id" = "e"."id"
                INNER JOIN organization o ON "e"."serviceProvider" = "o"."id"
                WHERE "o"."fhir_id" = $1
                AND "p"."occurrenceStart" IS NOT NULL
                GROUP BY EXTRACT(YEAR FROM "p"."occurrenceStart")
            ),
            report_counts AS (
                SELECT 
                    EXTRACT(YEAR FROM "dr"."effectiveDateTime") as year,
                    COUNT(*) as report_count
                FROM diagnostic_reports dr
                INNER JOIN encounters e ON "dr"."encounterId" = "e"."id"
                INNER JOIN organization o ON "e"."serviceProvider" = "o"."id"
                WHERE "o"."fhir_id" = $1
                AND "dr"."effectiveDateTime" IS NOT NULL
                GROUP BY EXTRACT(YEAR FROM "dr"."effectiveDateTime")
            )
            SELECT 
                COALESCE(pc.year, rc.year) as year,
                COALESCE(pc.procedure_count, 0) as procedures,
                COALESCE(rc.report_count, 0) as reports
            FROM procedure_counts pc
            FULL OUTER JOIN report_counts rc ON pc.year = rc.year
            ORDER BY year ASC
        `;

        const result = await this.proceduresRepository.query(query, [organizationFhirId]);
        return result;
    }

    async getProcedureCountByCategory(organizationFhirId: string, practitionerId?: string): Promise<any> {
        try {
            // Input validation
            const organization = await this.organizationRepository.findOne({ where: { fhirId: organizationFhirId } });
            if (!organization) {
                throw new NotFoundException(`Organization with FHIR ID ${organizationFhirId} not found`);
            }

            let query = `--sql
                        SELECT 
                            p.category as category,
                            COUNT(DISTINCT p.id) as count
                        FROM procedures p
                        INNER JOIN encounters e ON p.encounter_id = e.id
                        INNER JOIN organization o ON e."serviceProvider" = o.id
                        INNER JOIN encounter_practitioners ep ON e.id = ep.encounter_id
                        WHERE o.managing_organization = $1
                            AND ep.practitioner_id = COALESCE($2, ep.practitioner_id)
                        GROUP BY p.category
            `;

            const result = await this.proceduresRepository.query(query, [organization.id, practitionerId ?? null]);
            return result;
        } catch (error) {
            console.error('Error fetching procedure count by category:', error);
            if (error.message.includes('relation') || error.message.includes('column')) {
                throw new Error('Database schema error. Please check if all required tables and columns exist.');
            }
            throw new Error('Failed to fetch procedure statistics');
        }
    }
} 