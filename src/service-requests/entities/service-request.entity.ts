import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';

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
export class ServiceRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
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

    @Column({ default: false })
    doNotPerform: boolean;

    @ManyToOne(() => Patient, { eager: true })
    @JoinColumn({ name: 'subjectId' })
    subject: Patient;

    @ManyToOne(() => Encounter, { nullable: true, eager: true })
    @JoinColumn({ name: 'encounterId' })
    encounter: Encounter;

    @Column('timestamptz', { array: true })
    occurrence: Date[];

    @Column({ nullable: true })
    code: string;

    @Column({ type: 'timestamptz', nullable: true })
    authoredOn: Date;

    @ManyToOne(() => Practitioner, { nullable: true, eager: true })
    @JoinColumn({ name: 'requesterId' })
    requester: Practitioner;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
