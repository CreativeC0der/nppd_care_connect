import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Device } from './device.entity';
import { ServiceRequest } from 'src/service-requests/entities/service-request.entity';
import { DeviceUsageStatus } from 'src/Utils/enums/device-usage.enum';

@Entity('device_usage')
export class DeviceUsage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: DeviceUsageStatus,
        default: DeviceUsageStatus.ACTIVE
    })
    status: DeviceUsageStatus;

    @ManyToOne(() => Patient, { nullable: false })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => Encounter, { nullable: true })
    @JoinColumn({ name: 'encounter_id' })
    context: Encounter;

    @Column({ type: 'timestamp' })
    start: Date;

    @Column({ type: 'timestamp', nullable: true })
    end: Date;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @ManyToOne(() => Device, (device) => device.deviceUsages, { nullable: false })
    @JoinColumn({ name: 'device_id' })
    device: Device;

    @ManyToOne(() => ServiceRequest, { nullable: true })
    @JoinColumn({ name: 'service_request_id' })
    basedOn: ServiceRequest;
} 