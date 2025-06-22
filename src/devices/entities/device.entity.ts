import { Patient } from 'src/patients/entities/patient.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    fhirId: string;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    statusReason: string;

    @Column({ nullable: true })
    manufacturer: string;

    @Column({ type: 'timestamp', nullable: true })
    manufactureDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    expirationDate: Date;

    @Column({ nullable: true })
    lotNumber: string;

    @Column({ nullable: true })
    serialNumber: string;

    @Column({ nullable: true })
    deviceName: string;

    @Column({ nullable: true })
    display: string;
}
