import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { MedicationRequest } from './medication-request.entity';

export enum MedicationStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ENTERED_IN_ERROR = 'entered-in-error',
}

export enum MedicationDoseForm {
    POWDER = 'powder',
    TABLETS = 'tablets',
    CAPSULE = 'capsule',
}

@Entity('medications')
export class Medication {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column({ nullable: true })
    code: string;

    @Column({ name: 'definition', nullable: true })
    definition: string;

    @Column({
        type: 'enum',
        enum: MedicationStatus,
        nullable: true
    })
    status: MedicationStatus;

    @Column({
        name: 'doseForm',
        type: 'enum',
        enum: MedicationDoseForm,
        nullable: true
    })
    doseForm: MedicationDoseForm;

    @Column({ name: 'totalVolumeValue', type: 'double precision', nullable: true })
    totalVolumeValue: number;

    @Column({ name: 'totalVolumeUnit', nullable: true })
    totalVolumeUnit: string;

    @Column({ type: 'jsonb', nullable: true })
    ingredient: { item: string, value: string }[];

    @Column({ name: 'batchLotNumber', nullable: true })
    batchLotNumber: string;

    @Column({ name: 'batchExpirationDate', type: 'timestamp', nullable: true })
    batchExpirationDate: Date;

    @OneToMany(() => MedicationRequest, (mr) => mr.medication)
    medicationRequests: MedicationRequest[];
}
