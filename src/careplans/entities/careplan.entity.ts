import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, JoinTable, ManyToMany } from 'typeorm';
import { CarePlanActivity } from './careplan-activity.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Condition } from 'src/conditions/entities/condition.entity';

@Entity('careplans')
export class CarePlan {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ unique: true })
    fhirId: string;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    intent: string;

    @Column({ nullable: true })
    category: string; // Typically from coding, e.g., "assess-plan", "mental-health"

    @Column({ type: 'date', nullable: true })
    startDate: Date | null;

    @Column({ type: 'date', nullable: true })
    endDate: Date | null;

    @ManyToOne(() => Patient, { nullable: true, onDelete: 'CASCADE', cascade: true })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @OneToMany(() => CarePlanActivity, activity => activity.carePlan, { cascade: true })
    activities: CarePlanActivity[];

    @ManyToOne(() => Encounter, encounter => encounter.carePlans, { cascade: true, nullable: true })
    encounter: Encounter | null;

    @ManyToMany(() => Condition, condition => condition.carePlans, { cascade: true, nullable: true })
    @JoinTable({
        name: 'careplan_conditions',
        joinColumn: { name: 'careplan_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'condition_id', referencedColumnName: 'id' },
    })
    conditions: Condition[];
}
