import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Slot } from './slot.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';

@Entity('schedules')
export class Schedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column({ default: true })
    active: boolean;

    @Column({ name: 'serviceCategory', nullable: true })
    serviceCategory: string;

    @Column({ name: 'serviceType', nullable: true })
    serviceType: string;

    @Column({ nullable: true })
    specialty: string;

    @Column({ nullable: true })
    name: string;

    @Column({ name: 'planningHorizonStart', type: 'timestamp', nullable: true })
    planningHorizonStart: Date;

    @Column({ name: 'planningHorizonEnd', type: 'timestamp', nullable: true })
    planningHorizonEnd: Date;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @ManyToOne(() => Practitioner, (practitioner) => practitioner.schedules, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'practitionerId' })
    actor: Practitioner;

    @OneToMany(() => Slot, (slot) => slot.schedule,)
    slots: Slot[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
