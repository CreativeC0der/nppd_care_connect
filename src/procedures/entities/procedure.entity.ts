import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';

export enum ProcedureStatus {
    PREPARATION = 'preparation',
    IN_PROGRESS = 'in-progress',
    NOT_DONE = 'not-done',
    ON_HOLD = 'on-hold',
    STOPPED = 'stopped',
    COMPLETED = 'completed',
    ENTERED_IN_ERROR = 'entered-in-error',
    UNKNOWN = 'unknown',
}

@Entity('procedures')
export class Procedure {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: ProcedureStatus,
        default: ProcedureStatus.PREPARATION,
    })
    status: ProcedureStatus;

    @Column({ nullable: true })
    code: string;

    @ManyToOne(() => Patient, patient => patient.procedures, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    subject: Patient;

    @ManyToOne(() => Encounter, encounter => encounter.procedures, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'encounter_id' })
    encounter?: Encounter | null;

    @Column({ name: 'occurrenceStart', type: 'timestamp', nullable: true })
    occurrenceStart: Date;

    @Column({ name: 'occurrenceEnd', type: 'timestamp', nullable: true })
    occurrenceEnd: Date;

    @OneToMany(() => Condition, condition => condition.procedure)
    reasons: Condition[];
} 