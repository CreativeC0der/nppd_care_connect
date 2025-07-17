import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
} from 'typeorm';

export enum ObservationCategory {
    SOCIAL_HISTORY = 'social-history',
    VITAL_SIGNS = 'vital-signs',
    IMAGING = 'imaging',
    LABORATORY = 'laboratory',
    PROCEDURE = 'procedure',
    SURVEY = 'survey',
    EXAM = 'exam',
    THERAPY = 'therapy',
    ACTIVITY = 'activity',
}
export enum ObservationStatus {
    REGISTERED = 'registered',
    PRELIMINARY = 'preliminary',
    FINAL = 'final',
    AMENDED = 'amended',
    CORRECTED = 'corrected',
    CANCELLED = 'cancelled',
    ENTERED_IN_ERROR = 'entered-in-error',
    UNKNOWN = 'unknown',
}

@Entity('observations')
@Index(['fhirId', 'code'], { unique: true })
export class Observation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fhirId: string;

    @Column({
        type: 'enum',
        enum: ObservationStatus,
    })
    status: ObservationStatus;

    @Column({
        type: 'enum',
        enum: ObservationCategory,
    })
    category: ObservationCategory;

    @Column()
    code: string;

    @Column({ type: 'timestamp', nullable: true })
    effectiveDateTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    issued: Date;

    @Column()
    value: string;

    @Column()
    unit: string;

    // Relations
    @ManyToOne(() => Patient, patient => patient.observations, { cascade: true })
    patient: Patient;

    @ManyToOne(() => Encounter, encounter => encounter.observations, { cascade: true, nullable: true })
    encounter: Encounter | null;
}
