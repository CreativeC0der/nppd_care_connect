import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Location } from 'src/locations/entities/location.entity';
import { Organization } from 'src/organizations/entities/organization.entity';
import { DeviceStatus, DeviceAvailabilityStatus } from 'src/Utils/enums/device.enum';
import { DeviceUsage } from './device-usage.entity';

@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: DeviceStatus,
        default: DeviceStatus.ACTIVE
    })
    status: DeviceStatus;

    @Column({
        type: 'enum',
        enum: DeviceAvailabilityStatus,
        default: DeviceAvailabilityStatus.AVAILABLE
    })
    availabilityStatus: DeviceAvailabilityStatus;

    @Column({ nullable: true })
    manufacturer: string;

    @Column({ unique: true })
    serialNumber: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    category: string;

    @ManyToOne(() => Location, { nullable: true })
    @JoinColumn({ name: 'location_id' })
    location: Location;

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'owner_id' })
    owner: Organization;

    @OneToMany(() => DeviceUsage, (deviceUsage) => deviceUsage.device)
    deviceUsages: DeviceUsage[];
}
