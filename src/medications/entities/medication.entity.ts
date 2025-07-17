import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { MedicationRequest } from './medication-request.entity';

@Entity('medications')
export class Medication {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    // CodeableConcept: code (e.g., medication name)
    @Column({ nullable: true })
    code: string;

    // Status (active | inactive | entered-in-error)
    @Column({ type: 'enum', enum: ['active', 'inactive', 'entered-in-error'], nullable: true })
    status: 'active' | 'inactive' | 'entered-in-error';

    // Dose form
    @Column({ type: 'enum', enum: ['powder', 'tablets', 'capsule'], nullable: true })
    doseForm: 'powder' | 'tablets' | 'capsule'

    // Total volume
    @Column({ type: 'float', nullable: true })
    totalVolumeValue: number;

    @Column({ nullable: true })
    totalVolumeUnit: string;

    // Ingredient (single, simplified — can normalize later)
    @Column({ type: 'jsonb', nullable: true })
    ingredient: { item: string, value: string }[];

    // Batch info
    @Column({ nullable: true })
    batchLotNumber: string;

    @Column({ type: 'timestamp', nullable: true })
    batchExpirationDate: Date;

    @OneToMany(() => MedicationRequest, (mr) => mr.medication)
    medicationRequests: MedicationRequest[];
}
