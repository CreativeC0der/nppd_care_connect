import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    identifier: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: 'date' })
    birthDate: string;

    @Column()
    gender: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    preferredLanguage: string;

    @Column({ default: true })
    active: boolean;

    @Column({ default: false })
    deceased: boolean;

    @Column({ type: 'date', nullable: true })
    dateOfDeath: string;

    @Column({ nullable: true })
    managingOrganizationId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
