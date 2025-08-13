import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Schedule } from './schedule.entity';
import { SlotStatus } from 'src/Utils/enums/slot_status.enum';

@Entity('slots')
export class Slot {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: SlotStatus,
        default: SlotStatus.FREE,
    })
    status: SlotStatus;

    @Column({ type: 'timestamp' })
    start: Date;

    @Column({ type: 'timestamp' })
    end: Date;

    @Column({ type: 'text', nullable: true })
    comment: string;

    // Many slots can belong to one appointment
    @ManyToOne(() => Appointment, (appointment) => appointment.slots, { nullable: true })
    @JoinColumn({ name: 'appointmentId' })
    appointment: Appointment;

    // Optional link to Schedule
    @ManyToOne(() => Schedule, (schedule) => schedule.slots, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'scheduleId' })
    schedule: Schedule;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
