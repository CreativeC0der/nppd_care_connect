import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    JoinColumn,
} from 'typeorm';
import { DiagnosticReport } from 'src/diagnostic-reports/entities/diagnostic-report.entity';

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

    @Column({ name: 'fhirId' })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: ObservationStatus,
        nullable: true,
    })
    status: ObservationStatus;

    @Column({
        type: 'enum',
        enum: ObservationCategory,
        nullable: true,
    })
    category: ObservationCategory;

    @Column()
    code: string;

    @Column({ name: 'effectiveDateTime', type: 'timestamp', nullable: true })
    effectiveDateTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    issued: Date;

    @Column()
    value: string;

    @Column()
    unit: string;

    // Relations
    @ManyToOne(() => Patient, patient => patient.observations, { cascade: true })
    @JoinColumn({ name: 'patientId' })
    patient: Patient;

    @ManyToOne(() => Encounter, encounter => encounter.observations, { cascade: true, nullable: true })
    @JoinColumn({ name: 'encounterId' })
    encounter: Encounter | null;

    @ManyToOne(() => DiagnosticReport, diagnosticReport => diagnosticReport.results, { cascade: true, nullable: true })
    @JoinColumn({ name: 'diagnosticReportId' })
    diagnosticReport: DiagnosticReport | null;
}
