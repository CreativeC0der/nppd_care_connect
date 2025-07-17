import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum QuestionnaireStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    RETIRED = 'retired',
    UNKNOWN = 'unknown',
}

@Entity()
export class Questionnaire {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column({
        type: 'enum',
        enum: QuestionnaireStatus,
    })
    status: QuestionnaireStatus;

    @Column({ type: 'simple-array', nullable: true })
    subjectType: string[]; // e.g., ["Patient"]

    @Column({ type: 'jsonb' })
    items: any; // FHIR Questionnaire.item[] structure

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
