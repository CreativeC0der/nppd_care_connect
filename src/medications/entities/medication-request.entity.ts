import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
@Entity('medication_requests')
export class MedicationRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    fhirId: string;

    @Column()
    intent: string;

    @Column({ nullable: true })
    display: string;

    @Column({ type: 'timestamp', nullable: true })
    authoredOn: Date | null;

    @ManyToOne(() => Patient, patient => patient.medications, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => Encounter, encounter => encounter.medications, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;

    @ManyToOne(() => Practitioner, practitioner => practitioner.medications, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'practitioner_id' })
    practitioner: Practitioner;
}
