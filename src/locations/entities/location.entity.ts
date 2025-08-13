import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from 'src/organizations/entities/organization.entity';
import { HealthcareService } from 'src/healthcare-services/entities/healthcare-service.entity';

export enum LocationStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    INACTIVE = 'inactive',
}

export enum LocationMode {
    INSTANCE = 'instance',
    KIND = 'kind',
}

@Entity('locations')
export class Location {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', nullable: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: LocationStatus,
        nullable: true
    })
    status: LocationStatus;

    @Column({ nullable: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: LocationMode,
        nullable: true
    })
    mode: LocationMode;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    contact: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ nullable: true })
    form: string;

    @ManyToOne(() => Location, { nullable: true })
    @JoinColumn({ name: 'partOf' })
    partOf: Location;

    @OneToMany(() => Location, location => location.partOf)
    subLocations: Location[];

    @ManyToOne(() => HealthcareService, { nullable: true })
    @JoinColumn({ name: 'healthcare_service_id' })
    healthcareService: HealthcareService;

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'managingOrganization' })
    managingOrganization: Organization;
} 