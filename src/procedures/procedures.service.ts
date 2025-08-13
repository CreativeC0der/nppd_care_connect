import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Procedure } from './entities/procedure.entity';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { DiagnosticReport } from 'src/diagnostic-reports/entities/diagnostic-report.entity';

@Injectable()
export class ProceduresService {
    constructor(
        @InjectRepository(Procedure)
        private proceduresRepository: Repository<Procedure>,
        @InjectRepository(Patient)
        private patientsRepository: Repository<Patient>,
        @InjectRepository(Encounter)
        private encountersRepository: Repository<Encounter>,
        @InjectRepository(DiagnosticReport)
        private diagnosticReportsRepository: Repository<DiagnosticReport>,
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

    async findAll(): Promise<Procedure[]> {
        return this.proceduresRepository.find({
            relations: ['subject', 'encounter', 'reason'],
        });
    }

    async findOne(id: string): Promise<Procedure> {
        const procedure = await this.proceduresRepository.findOne({
            where: { id },
            relations: ['subject', 'encounter', 'reason'],
        });

        if (!procedure) {
            throw new NotFoundException(`Procedure with ID ${id} not found`);
        }

        return procedure;
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

    async update(id: string, updateProcedureDto: UpdateProcedureDto): Promise<Procedure> {
        const procedure = await this.findOne(id);
        const { subjectId, encounterId, ...updateData } = updateProcedureDto;

        // Update patient if provided
        if (subjectId) {
            const patient = await this.patientsRepository.findOne({ where: { id: subjectId } });
            if (!patient) {
                throw new NotFoundException(`Patient with ID ${subjectId} not found`);
            }
            procedure.subject = patient;
        }

        // Update encounter if provided
        if (encounterId) {
            const encounter = await this.encountersRepository.findOne({ where: { id: encounterId } });
            if (!encounter) {
                throw new NotFoundException(`Encounter with ID ${encounterId} not found`);
            }
            procedure.encounter = encounter;
        }

        Object.assign(procedure, updateData);
        return this.proceduresRepository.save(procedure);
    }

    async remove(id: string): Promise<void> {
        const procedure = await this.findOne(id);
        await this.proceduresRepository.remove(procedure);
    }

    async getProcedureAndReportCountsByYear(organizationFhirId: string): Promise<any[]> {
        const query = `
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
} 