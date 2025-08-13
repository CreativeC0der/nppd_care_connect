import { CarePlan } from 'src/careplans/entities/careplan.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Procedure } from 'src/procedures/entities/procedure.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    ManyToMany,
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

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column({
        name: 'clinicalStatus',
        type: 'enum',
        enum: ClinicalStatus,
    })
    clinicalStatus: ClinicalStatus;

    @Column({
        name: 'verificationStatus',
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

    @Column({ name: 'bodySite', nullable: true })
    bodySite: string;

    @Column({ name: 'onsetDateTime', type: 'timestamp', nullable: true })
    onsetDateTime: Date;

    @Column({ name: 'recordedDate', type: 'timestamp', nullable: true })
    recordedDate: Date | null;

    @Column({ nullable: true })
    note: string;

    @ManyToOne(() => Patient, patient => patient.conditions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    subject: Patient;

    @ManyToOne(() => Encounter, encounter => encounter.conditions, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'encounterId' })
    encounter: Encounter;

    @ManyToMany(() => CarePlan, carePlan => carePlan.conditions)
    carePlans: CarePlan[];

    @ManyToOne(() => Procedure, procedure => procedure.reasons, { nullable: true })
    @JoinColumn({ name: 'procedure_id' })
    procedure: Procedure;
}
