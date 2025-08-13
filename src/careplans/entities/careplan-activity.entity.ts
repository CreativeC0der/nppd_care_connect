import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CarePlan } from './careplan.entity';

@Entity('careplan_activities')
export class CarePlanActivity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'detailText', type: 'text', nullable: true })
    detailText: string;

    @Column({ nullable: true })
    status: string;

    @ManyToOne(() => CarePlan, carePlan => carePlan.activities, { nullable: false, cascade: true, orphanedRowAction: 'delete' })
    @JoinColumn({ name: 'careplan_id' })
    carePlan: CarePlan;
}
