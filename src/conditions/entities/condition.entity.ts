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
} from 'typeorm';

@Entity('conditions')
export class Condition {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column({ nullable: true })
    clinicalStatus: string;

    @Column({ nullable: true })
    verificationStatus: string;

    @Column({ nullable: true })
    display: string;

    @Column({ type: 'timestamp', nullable: true })
    onsetDateTime: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    abatementDateTime: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    recordedDate: Date | null;

    @ManyToOne(() => Patient, patient => patient.conditions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => Encounter, encounter => encounter.conditions, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;

    @ManyToMany(() => CarePlan, carePlan => carePlan.conditions)
    carePlans: CarePlan[];
}
