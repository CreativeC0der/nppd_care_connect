import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    JoinTable,
    ManyToMany,
    Unique,
} from 'typeorm';
import { Medication } from './medication.entity';

export enum MedicationRequestIntent {
    PROPOSAL = 'proposal',
    PLAN = 'plan',
    ORDER = 'order',
    ORIGINAL_ORDER = 'original-order',
    REFLEX_ORDER = 'reflex-order',
    FILLER_ORDER = 'filler-order',
    INSTANCE_ORDER = 'instance-order',
    OPTION = 'option',
}

export enum MedicationRequestStatus {
    ACTIVE = 'active',
    ON_HOLD = 'on-hold',
    ENDED = 'ended',
    STOPPED = 'stopped',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    ENTERED_IN_ERROR = 'entered-in-error',
    DRAFT = 'draft',
    UNKNOWN = 'unknown',
}

export enum MedicationRequestPriority {
    ROUTINE = 'routine',
    URGENT = 'urgent',
    ASAP = 'asap',
    STAT = 'stat',
}

@Entity('medication_requests')
@Unique(['fhirId', 'medication']) // Composite unique constraint
export class MedicationRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fhirId: string;

    @Column({
        type: 'enum',
        enum: MedicationRequestIntent,
    })
    intent: MedicationRequestIntent;

    @Column({
        type: 'enum',
        enum: MedicationRequestStatus,
        nullable: true,
    })
    status: MedicationRequestStatus;

    @Column({ nullable: true })
    reason: string;

    @Column({ type: 'timestamp', nullable: true })
    authoredOn: Date | null;

    @Column({
        type: 'enum',
        enum: MedicationRequestPriority,
        nullable: true,
    })
    priority: MedicationRequestPriority;

    @Column({ type: 'text', nullable: true })
    doseInstruction: string;

    @Column({ type: 'jsonb', nullable: true })
    dosePeriod: { start: string; end: string };

    @ManyToOne(() => Patient, patient => patient.medications, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'patient_id' })
    subject: Patient;

    @ManyToOne(() => Encounter, encounter => encounter.medications, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;

    @ManyToOne(() => Practitioner, practitioner => practitioner.medications, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'practitioner_id' })
    requester: Practitioner;

    @ManyToOne(() => Medication, { eager: true })
    @JoinColumn({ name: 'medication_id' })
    medication: Medication;
}
