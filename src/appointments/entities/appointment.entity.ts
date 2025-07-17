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

@Entity()
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.BOOKED,
    })
    status: AppointmentStatus;

    @Column({ nullable: true })
    serviceCategory: string;

    @Column({ nullable: true })
    specialty: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    reason: string;

    // Reference to Patient
    @ManyToOne(() => Patient, { eager: true })
    @JoinColumn({ name: 'patientId' })
    patient: Patient;

    // Reference to Practitioners
    @ManyToMany(() => Practitioner, { eager: true })
    @JoinTable()
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
