import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum NutritionProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ENTERED_IN_ERROR = 'entered-in-error',
}

@Entity()
export class NutritionProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column({ nullable: true })
    code: string;

    // Status: enum
    @Column({ type: 'enum', enum: NutritionProductStatus })
    status: NutritionProductStatus;

    // Category: Array of CodeableConcept (flattened into comma-separated strings)
    @Column({ type: 'text', nullable: true })
    category: string;

    // Manufacturer references
    @Column('text', { nullable: true })
    manufacturer: string;

    // Nutrients and ingredients (JSON for simplicity)
    @Column({ type: 'jsonb', nullable: true })
    nutrients: { item: string, value: string }[];

    @Column({ type: 'jsonb', nullable: true })
    ingredients: { item: string, value: string }[];

    @Column({ type: 'timestamp', nullable: true })
    expirationDate: Date;

    @Column({ nullable: true })
    lotNumber: string;

    @Column({ nullable: true })
    quantity: string;
}
