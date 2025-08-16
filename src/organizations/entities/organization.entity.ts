import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Admin } from 'src/admin/entities/admin.entity';

export enum OrganizationType {
    HEALTHCARE_PROVIDER = 'healthcare_provider',
    HOSPITAL_DEPARTMENT = 'hospital_department',
    ORGANIZATIONAL_TEAM = 'organizational_team',
    GOVERNMENT = 'government',
    INSURANCE_COMPANY = 'insurance_company',
    EDUCATIONAL_INSTITUTE = 'educational_institute',
    RELIGIOUS_INSTITUTION = 'religious_institution',
    CLINICAL_RESEARCH_SPONSOR = 'clinical_research_sponsor',
    COMMUNITY_GROUP = 'community_group',
    BUSINESS_CORPORATION = 'business_corporation',
    OTHER = 'other'
}

@Entity('organization')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', type: 'varchar', length: 64, unique: true })
    fhirId: string;

    @Column({ nullable: true })
    active: boolean;

    @Column({
        type: 'enum',
        enum: OrganizationType,
        nullable: true
    })
    type: OrganizationType;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    contact: string;

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'part_of' })
    parentOrganization: Organization | null;

    @OneToMany(() => Organization, organization => organization.parentOrganization)
    childOrganizations: Organization[];

    @Column({ type: 'text', nullable: true })
    qualification: string;

    @OneToMany(() => Admin, admin => admin.organization)
    admins: Admin[];

    @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'managing_organization' })
    managingOrganization: Organization | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 