import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CarePlan } from './careplan.entity';

@Entity('careplan_activities')
export class CarePlanActivity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    detailText: string; // Text instruction, e.g. "Take medication twice daily"

    @Column({ nullable: true })
    status: string; // "scheduled", "in-progress", etc.

    @ManyToOne(() => CarePlan, carePlan => carePlan.activities, { nullable: false, cascade: true, orphanedRowAction: 'delete' })
    @JoinColumn({ name: 'careplan_id' })
    carePlan: CarePlan;
}
