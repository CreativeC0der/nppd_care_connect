import { Organization } from 'src/organizations/entities/organization.entity';
import { Role } from 'src/Utils/enums/role.enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('admins')
export class Admin {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column({ name: 'firstName' })
    firstName: string;

    @Column({ name: 'lastName' })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ name: 'firebaseUid', nullable: true, unique: true })
    firebaseUid: string;

    @Column({ default: true })
    active: boolean;

    @Column({ name: 'lastLoginAt', type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @Column({ name: 'permissions', type: 'json', nullable: true })
    permissions: object;

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'organization_id' })
    organization?: Organization | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
} 