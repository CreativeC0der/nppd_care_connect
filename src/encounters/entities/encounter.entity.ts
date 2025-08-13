import { Appointment } from 'src/appointments/entities/appointment.entity';
import { CarePlan } from 'src/careplans/entities/careplan.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import { MedicationRequest } from 'src/medications/entities/medication-request.entity';
import { Observation } from 'src/observations/entities/observation.entity';
import { MedicalRecord } from 'src/past-medical-records/entities/past-medical-record.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { Organization } from 'src/organizations/entities/organization.entity';
import { Procedure } from 'src/procedures/entities/procedure.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { Location } from 'src/locations/entities/location.entity';
import { HealthcareService } from 'src/healthcare-services/entities/healthcare-service.entity';
import { ServiceRequest } from 'src/service-requests/entities/service-request.entity';
import { DiagnosticReport } from 'src/diagnostic-reports/entities/diagnostic-report.entity';

export enum EncounterStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in-progress',
    ON_HOLD = 'on-hold',
    DISCHARGED = 'discharged',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    DISCONTINUED = 'discontinued',
    ENTERED_IN_ERROR = 'entered-in-error',
    UNKNOWN = 'unknown',
}

export enum EncounterClass {
    INPATIENT = 'IMP' as any,
    AMBULATORY = 'AMB' as any,
    OBSERVATION = 'OBSENC' as any,
    EMERGENCY = 'EMER' as any,
    VIRTUAL = 'VR' as any,
    HOME = 'HH' as any,
}

@Entity('encounters')
export class Encounter {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: EncounterStatus,
        default: EncounterStatus.PLANNED,
    })
    status: EncounterStatus;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    reason: string;

    @Column({ type: 'timestamp', nullable: true })
    start: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    end: Date | null;

    @ManyToOne(() => Patient, patient => patient.encounters, { onDelete: 'SET NULL', nullable: false })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @OneToOne(() => Appointment)
    @JoinColumn({ name: 'appointmentId' })
    appointment: Appointment;

    @Column({
        name: 'class',
        type: 'enum',
        enum: EncounterClass,
        nullable: true
    })
    class: EncounterClass;

    @ManyToOne(() => HealthcareService, { nullable: true })
    @JoinColumn({ name: 'serviceType' })
    serviceType: HealthcareService;

    @ManyToOne(() => Encounter, { nullable: true })
    @JoinColumn({ name: 'partOf' })
    partOf: Encounter;

    @ManyToOne(() => Location, { nullable: true })
    @JoinColumn({ name: 'location' })
    location: Location;

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'serviceProvider' })
    serviceProvider: Organization;

    @ManyToMany(() => Practitioner, practitioner => practitioner.encounters)
    @JoinTable({
        name: 'encounter_practitioners',
        joinColumn: { name: 'encounter_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'practitioner_id', referencedColumnName: 'id' },
    })
    practitioners: Practitioner[];

    @OneToMany(() => CarePlan, carePlan => carePlan.encounter)
    carePlans: CarePlan[];

    @OneToMany(() => Condition, condition => condition.encounter)
    conditions: Condition[];

    @OneToMany(() => MedicationRequest, medication => medication.encounter)
    medications: MedicationRequest[];

    @OneToMany(() => Observation, observation => observation.encounter)
    observations: Observation[];

    @OneToMany(() => MedicalRecord, medicalRecord => medicalRecord.encounter)
    medicalRecords: MedicalRecord[];

    @OneToMany(() => ServiceRequest, serviceRequest => serviceRequest.initiatedByEncounter)
    generatedServiceRequests: ServiceRequest[];

    @ManyToMany(() => ServiceRequest, { cascade: true, onDelete: 'CASCADE' })
    @JoinTable({
        name: 'encounter_based_on',
        joinColumn: { name: 'encounter_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'service_request_id', referencedColumnName: 'id' },
    })
    basedOnServiceRequests: ServiceRequest[];

    @OneToMany(() => DiagnosticReport, diagnosticReport => diagnosticReport.encounter)
    diagnosticReports: DiagnosticReport[];

    @OneToMany(() => Procedure, procedure => procedure.encounter)
    procedures: Procedure[];
}
