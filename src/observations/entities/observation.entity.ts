import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';

@Entity()
export class Observation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column()
    status: string;

    @Column({ nullable: true })
    category: string;

    @Column()
    code: string;

    @Column({ type: 'timestamp', nullable: true })
    effectiveDateTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    issued: Date;

    @Column({ type: 'float', nullable: true })
    value: number;

    @Column({ nullable: true })
    unit: string;

    // Relations
    @ManyToOne(() => Patient, patient => patient.observations, { cascade: true })
    patient: Patient;

    @ManyToOne(() => Encounter, encounter => encounter.observations, { cascade: true, nullable: true })
    encounter: Encounter | null;

}
