import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Practitioner } from './practitioner.entity';
import { Organization } from 'src/organizations/entities/organization.entity';
import { HealthcareService } from 'src/healthcare-services/entities/healthcare-service.entity';

@Entity('practitioner_roles')
export class PractitionerRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false, unique: true })
    fhirId: string;

    @Column({ default: true })
    active: boolean;

    @Column({ nullable: true })
    specialty: string;

    @Column({ nullable: true })
    code: string;

    @ManyToOne(() => Practitioner, practitioner => practitioner.practitionerRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'practitioner_id' })
    practitioner: Practitioner;

    @ManyToOne(() => Organization, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @ManyToOne(() => HealthcareService, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'healthcare_service_id' })
    healthcareService: HealthcareService;
} 