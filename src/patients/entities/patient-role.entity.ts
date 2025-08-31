import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

@Entity('patient_roles')
export class PatientRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ default: 'active' })
    status: 'active' | 'inactive';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
} 