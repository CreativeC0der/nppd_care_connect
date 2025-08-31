import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { Slot } from '../../schedules/entities/slot.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

export enum AppointmentStatus {
    PROPOSED = 'proposed',
    PENDING = 'pending',
    BOOKED = 'booked',
    ARRIVED = 'arrived',
    FULFILLED = 'fulfilled',
    CANCELLED = 'cancelled',
    NOSHOW = 'noshow',
    ENTERED_IN_ERROR = 'entered-in-error',
    CHECKED_IN = 'checked-in',
    WAITLIST = 'waitlist'
}

@Entity('appointment')
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.BOOKED,
    })
    status: AppointmentStatus;

    @Column({ name: 'serviceCategory', nullable: true })
    serviceCategory: string;

    @Column({ nullable: true })
    specialty: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    reason: string;

    @Column({ name: 'start', type: 'timestamp', nullable: true })
    start: Date;

    @Column({ name: 'end', type: 'timestamp', nullable: true })
    end: Date;

    // Reference to Patient
    @ManyToOne(() => Patient, { eager: true, nullable: false })
    @JoinColumn({ name: 'patientId' })
    patient: Patient;

    // Reference to Organization (service provider)
    @ManyToOne(() => Organization, { nullable: false })
    @JoinColumn({ name: 'serviceProvider' })
    serviceProvider: Organization;

    // Reference to Practitioners
    @ManyToMany(() => Practitioner, { eager: true })
    @JoinTable({
        name: 'appointment_participants',
        joinColumn: { name: 'appointmentId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'practitionersId', referencedColumnName: 'id' },
    })
    participants: Practitioner[];

    @OneToMany(() => Slot, slot => slot.appointment)
    slots: Slot[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => Encounter, { nullable: true })
    encounter: Encounter;
}
