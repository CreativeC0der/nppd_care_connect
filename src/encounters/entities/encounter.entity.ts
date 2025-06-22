import { CarePlan } from 'src/careplans/entities/careplan.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import { MedicationRequest } from 'src/medications/entities/medication-request.entity';
import { Observation } from 'src/observations/entities/observation.entity';
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
} from 'typeorm';

@Entity('encounters')
export class Encounter {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column()
    status: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    reason: string;

    @Column({ type: 'timestamp', nullable: true })
    start: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    end: Date | null;

    @ManyToOne(() => Patient, patient => patient.encounters, { onDelete: 'SET NULL' })
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
}
