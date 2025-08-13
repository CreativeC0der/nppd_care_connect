import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

export enum MedicalRecordType {
    PRESCRIPTION = 'prescription',
    LAB_REPORT = 'lab-report',
    DISCHARGE_SUMMARY = 'discharge-summary',
    IMAGING = 'imaging',
    NOTE = 'note',
    REFERRAL = 'referral',
    OTHER = 'other',
}

@Entity('medical_records')
export class MedicalRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column()
    type: string;

    @Column()
    title: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ nullable: true })
    issuer: string;

    @Column('text', { array: true, nullable: true })
    tags: string[];

    @Column({ type: 'text', nullable: true })
    summary: string;

    @Column({ type: 'jsonb', nullable: true })
    data: any;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;

    @ManyToOne(() => Encounter, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'encounterId' })
    encounter: Encounter;
}
