import { Location } from 'src/locations/entities/location.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('healthcare_services')
export class HealthcareService {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    active: boolean;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    name: string;

    @Column({ name: 'appointmentRequired', nullable: true })
    appointmentRequired: boolean;

    @Column({ nullable: true })
    availability: string;

    @OneToMany(() => Location, location => location.healthcareService)
    locations: Location[];
} 