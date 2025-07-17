import { Appointment } from 'src/appointments/entities/appointment.entity';
import { CarePlan } from 'src/careplans/entities/careplan.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import { MedicationRequest } from 'src/medications/entities/medication-request.entity';
import { Observation } from 'src/observations/entities/observation.entity';
import { MedicalRecord } from 'src/past-medical-records/entities/past-medical-record.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
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


@Entity('encounters')
export class Encounter {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: EncounterStatus,
        default: EncounterStatus.PLANNED,
    })
    status: EncounterStatus;

    @Column({ nullable: true })
    type: string;// Specific type of encounter (e.g. e-mail consultation, surgical day-care, ...)

    @Column({ nullable: true })
    reason: string;

    @Column({ type: 'timestamp', nullable: true })
    start: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    end: Date | null;

    @ManyToOne(() => Patient, patient => patient.encounters, { onDelete: 'SET NULL', nullable: false })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToMany(() => Practitioner, practitioner => practitioner.encounters, {
        cascade: true,
    })
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

    @OneToOne(() => Appointment)
    @JoinColumn()
    appointment: Appointment;

    @OneToMany(() => MedicalRecord, medicalRecord => medicalRecord.encounter)
    medicalRecords: MedicalRecord[];
}
