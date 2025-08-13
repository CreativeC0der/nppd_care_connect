import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Observation } from 'src/observations/entities/observation.entity';
import { ServiceRequest } from 'src/service-requests/entities/service-request.entity';

export enum DiagnosticReportStatus {
    REGISTERED = 'registered',
    PARTIAL = 'partial',
    PRELIMINARY = 'preliminary',
    MODIFIED = 'modified',
    FINAL = 'final',
    AMENDED = 'amended',
    CORRECTED = 'corrected',
    APPENDED = 'appended',
    CANCELLED = 'cancelled',
    ENTERED_IN_ERROR = 'entered-in-error',
    UNKNOWN = 'unknown',
}

@Entity('diagnostic_reports')
@Index(['fhirId'], { unique: true })
export class DiagnosticReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId' })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: DiagnosticReportStatus,
    })
    status: DiagnosticReportStatus;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    code: string;

    @Column({ name: 'effectiveDateTime', type: 'timestamp', nullable: true })
    effectiveDateTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    issued: Date;

    @Column({ type: 'text', nullable: true })
    media: string;

    // Relations
    @ManyToOne(() => Patient, patient => patient.diagnosticReports, { cascade: true })
    @JoinColumn({ name: 'patientId' })
    subject: Patient;

    @ManyToOne(() => Encounter, encounter => encounter.diagnosticReports, { cascade: true, nullable: true })
    @JoinColumn({ name: 'encounterId' })
    encounter: Encounter | null;

    @OneToMany(() => Observation, observation => observation.diagnosticReport, { nullable: true })
    results: Observation[];

    @OneToMany(() => ServiceRequest, serviceRequest => serviceRequest.diagnosticReport)
    basedOn: ServiceRequest[];
} 