import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';

export enum QuestionnaireResponseStatus {
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
    AMENDED = 'amended',
    ENTERED_IN_ERROR = 'entered-in-error',
    STOPPED = 'stopped',
}

@Entity('questionnaire_response')
export class QuestionnaireResponse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: QuestionnaireResponseStatus,
    })
    status: QuestionnaireResponseStatus;

    @Column({ type: 'timestamp', nullable: true })
    authored: Date;

    @Column({ type: 'jsonb', nullable: true })
    items: any;

    // References
    @ManyToOne(() => Questionnaire, { eager: true })
    @JoinColumn({ name: 'questionnaireId' })
    questionnaire: Questionnaire;

    @ManyToOne(() => Encounter, { nullable: false })
    @JoinColumn({ name: 'encounterId' })
    encounter: Encounter;

    @ManyToOne(() => Practitioner, { nullable: true })
    @JoinColumn({ name: 'authorId' })
    author: Practitioner | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
