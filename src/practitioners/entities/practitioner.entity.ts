import { Encounter } from 'src/encounters/entities/encounter.entity';
import { MedicationRequest } from 'src/medications/entities/medication-request.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';

@Entity('practitioners')
export class Practitioner {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ unique: true })
    fhirId: string;

    @Column({ nullable: true })
    prefix: string;

    @Column()
    givenName: string;

    @Column({ nullable: true })
    familyName: string;

    @Column({ nullable: true })
    gender: string;

    @Column({ type: 'date', nullable: true })
    birthDate: Date;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    qualification: string;

    @Column({ default: true })
    active: boolean;

    @ManyToMany(() => Encounter, encounter => encounter.practitioners)
    encounters: Encounter[];

    @OneToMany(() => MedicationRequest, medication => medication.practitioner)
    medications: MedicationRequest[];
}
