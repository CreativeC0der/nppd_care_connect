import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { MedicationRequest } from 'src/medications/entities/medication-request.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';

@Entity('practitioners')
export class Practitioner {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fhirId', unique: true })
    fhirId: string;

    @Column({ nullable: true })
    prefix: string;

    @Column({ name: 'firstName', nullable: true })
    firstName: string;

    @Column({ name: 'lastName', nullable: true })
    lastName: string;

    @Column({ nullable: true })
    gender: string;

    @Column({ name: 'birthDate', type: 'date', nullable: true })
    birthDate: Date;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    qualification: string;

    @Column({ default: true })
    active: boolean;

    @Column({ nullable: true, unique: true })
    firebaseUid: string;

    @ManyToMany(() => Encounter, encounter => encounter.practitioners)
    encounters: Encounter[];

    @OneToMany(() => MedicationRequest, medication => medication.requester)
    medications: MedicationRequest[];

    @ManyToMany(() => Appointment, appointment => appointment.participants)
    appointments: Appointment[];

    @OneToMany(() => Schedule, schedule => schedule.actor)
    schedules: Schedule[];
}
