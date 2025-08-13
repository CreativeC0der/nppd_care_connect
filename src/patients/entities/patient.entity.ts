import { CarePlan } from 'src/careplans/entities/careplan.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Device } from 'src/devices/entities/device.entity';
import { MedicationRequest } from 'src/medications/entities/medication-request.entity';
import { Observation } from 'src/observations/entities/observation.entity';
import { DiagnosticReport } from 'src/diagnostic-reports/entities/diagnostic-report.entity';
import { Procedure } from 'src/procedures/entities/procedure.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('patients')
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column({ name: 'firstName' })
    firstName: string;

    @Column({ name: 'lastName' })
    lastName: string;

    @Column({ name: 'birthDate', type: 'date', nullable: true })
    birthDate: string;

    @Column()
    gender: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column({ name: 'preferredLanguage', nullable: true })
    preferredLanguage: string;

    @Column({ default: true })
    active: boolean;

    @Column({ default: false })
    deceased: boolean;

    @Column({ name: 'dateOfDeath', type: 'date', nullable: true })
    dateOfDeath: string;

    @Column({ nullable: true, unique: true })
    firebaseUid: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;

    @OneToMany(() => Encounter, encounter => encounter.patient, { cascade: true })
    encounters: Encounter[];

    @OneToMany(() => CarePlan, carePlan => carePlan.patient)
    carePlans: CarePlan[];

    @OneToMany(() => Condition, condition => condition.subject)
    conditions: Condition[];

    @OneToMany(() => MedicationRequest, medication => medication.subject)
    medications: MedicationRequest[];

    @OneToMany(() => Observation, observation => observation.patient)
    observations: Observation[];

    @OneToMany(() => DiagnosticReport, diagnosticReport => diagnosticReport.subject)
    diagnosticReports: DiagnosticReport[];

    @OneToMany(() => Procedure, procedure => procedure.subject)
    procedures: Procedure[];
}
