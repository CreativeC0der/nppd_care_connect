import { CarePlan } from 'src/careplans/entities/careplan.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Device } from 'src/devices/entities/device.entity';
import { MedicationRequest } from 'src/medications/entities/medication-request.entity';
import { Observation } from 'src/observations/entities/observation.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: 'date' })
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

    @Column({ nullable: true })
    preferredLanguage: string;

    @Column({ default: true })
    active: boolean;

    @Column({ default: false })
    deceased: boolean;

    @Column({ type: 'date', nullable: true })
    dateOfDeath: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Encounter, encounter => encounter.patient)
    encounters: Encounter[];

    @OneToMany(() => CarePlan, carePlan => carePlan.patient)
    carePlans: CarePlan[];

    @OneToMany(() => Condition, condition => condition.subject)
    conditions: Condition[];

    @OneToMany(() => MedicationRequest, medication => medication.subject)
    medications: MedicationRequest[];

    @OneToMany(() => Observation, observation => observation.patient)
    observations: Observation[];
}
