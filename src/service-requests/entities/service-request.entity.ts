import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { HealthcareService } from 'src/healthcare-services/entities/healthcare-service.entity';
import { DiagnosticReport } from 'src/diagnostic-reports/entities/diagnostic-report.entity';

export enum ServiceRequestStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    ON_HOLD = 'on-hold',
    REVOKED = 'revoked',
    COMPLETED = 'completed',
    ENTERED_IN_ERROR = 'entered-in-error',
    UNKNOWN = 'unknown',
}

export enum ServiceRequestIntent {
    PROPOSAL = 'proposal',
    PLAN = 'plan',
    DIRECTIVE = 'directive',
    ORDER = 'order',
}

export enum ServiceRequestCategory {
    LABORATORY_PROCEDURE = 'Laboratory procedure',
    IMAGING = 'Imaging',
    COUNSELLING = 'Counselling',
    EDUCATION = 'Education',
    SURGICAL_PROCEDURE = 'Surgical procedure',
}

export enum ServiceRequestPriority {
    ROUTINE = 'routine',
    URGENT = 'urgent',
    ASAP = 'asap',
    STAT = 'stat',
}

@Entity('service_requests')
@Index(['fhirId'], { unique: true })
export class ServiceRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true, nullable: false })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: ServiceRequestStatus,
    })
    status: ServiceRequestStatus;

    @Column({
        type: 'enum',
        enum: ServiceRequestIntent,
    })
    intent: ServiceRequestIntent;

    @Column({
        type: 'enum',
        enum: ServiceRequestCategory,
    })
    category: ServiceRequestCategory;

    @Column({
        type: 'enum',
        enum: ServiceRequestPriority,
    })
    priority: ServiceRequestPriority;

    @Column({ name: 'doNotPerform', default: false })
    doNotPerform: boolean;

    @Column('timestamp', { array: true })
    occurrence: Date[];

    @Column({ nullable: true })
    code: string;

    @Column({ name: 'authoredOn', type: 'timestamp', nullable: true })
    authoredOn: Date;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;

    @ManyToOne(() => Patient, { eager: true })
    @JoinColumn({ name: 'subjectId' })
    subject: Patient;

    @ManyToOne(() => Encounter, { nullable: true, eager: true })
    @JoinColumn({ name: 'encounterId' })
    initiatedByEncounter: Encounter;

    @ManyToOne(() => Practitioner, { nullable: true, eager: true })
    @JoinColumn({ name: 'requesterId' })
    requester: Practitioner;

    @ManyToOne(() => HealthcareService, { nullable: true })
    @JoinColumn({ name: 'serviceType' })
    serviceType: HealthcareService;

    @ManyToOne(() => DiagnosticReport, diagnosticReport => diagnosticReport.basedOn, { cascade: true, nullable: true })
    @JoinColumn({ name: 'diagnosticReportId' })
    diagnosticReport: DiagnosticReport | null;
}
