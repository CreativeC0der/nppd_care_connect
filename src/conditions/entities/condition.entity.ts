import { CarePlan } from 'src/careplans/entities/careplan.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';

export enum ClinicalStatus {
    ACTIVE = 'active',
    RECURRENCE = 'recurrence',
    RELAPSE = 'relapse',
    INACTIVE = 'inactive',
    REMISSION = 'remission',
    RESOLVED = 'resolved',
    UNKNOWN = 'unknown',
}

export enum VerificationStatus {
    UNCONFIRMED = 'unconfirmed',
    PROVISIONAL = 'provisional',
    DIFFERENTIAL = 'differential',
    CONFIRMED = 'confirmed',
    REFUTED = 'refuted',
    ENTERED_IN_ERROR = 'entered-in-error',
}
export enum ConditionSeverity {
    MILD = 'mild',
    MODERATE = 'moderate',
    SEVERE = 'severe',
}

@Entity('conditions')
export class Condition {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: ClinicalStatus,
    })
    clinicalStatus: ClinicalStatus;

    @Column({
        type: 'enum',
        enum: VerificationStatus,
        nullable: true,
    })
    verificationStatus?: VerificationStatus;

    @Column({
        type: 'enum',
        enum: ConditionSeverity,
        nullable: true,
    })
    severity?: ConditionSeverity;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    bodySite: string;

    @Column({ type: 'timestamp', nullable: true })
    onsetDateTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    recordedDate: Date | null;

    @Column({ nullable: true })
    note: string;

    @ManyToOne(() => Patient, patient => patient.conditions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    subject: Patient;

    @ManyToOne(() => Encounter, encounter => encounter.conditions, { onDelete: 'SET NULL' })
    @JoinColumn()
    encounter: Encounter;

    @ManyToMany(() => CarePlan, carePlan => carePlan.conditions)
    carePlans: CarePlan[];
}
