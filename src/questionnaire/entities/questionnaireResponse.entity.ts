import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';

export enum QuestionnaireResponseStatus {
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
    AMENDED = 'amended',
    ENTERED_IN_ERROR = 'entered-in-error',
    STOPPED = 'stopped',
}

@Entity()
export class QuestionnaireResponse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: QuestionnaireResponseStatus,
    })
    status: QuestionnaireResponseStatus;

    @Column({ type: 'timestamp with time zone', nullable: true })
    authored: Date;

    @Column({ type: 'jsonb', nullable: true })
    items: any;

    // References
    @ManyToOne(() => Questionnaire, { eager: true })
    @JoinColumn({ name: 'questionnaireId' })
    questionnaire: Questionnaire;

    @OneToOne(() => Encounter, { nullable: false })
    @JoinColumn({ name: 'encounterId' })
    encounter: Encounter;

    @ManyToOne(() => Patient, { eager: true })
    @JoinColumn({ name: 'subjectId' })
    subject: Patient;

    @ManyToOne(() => Practitioner, { nullable: true })
    @JoinColumn({ name: 'authorId' })
    author: Practitioner | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
