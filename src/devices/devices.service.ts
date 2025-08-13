import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { DeviceUsage } from './entities/device-usage.entity';
import { Location } from 'src/locations/entities/location.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

export interface DeviceUtilizationResult {
    distinctDevicesUsed: number;
    totalDevices: number;
    utilization: number;
    deviceType: string;
    organizationFhirId: string;
}

@Injectable()
export class DevicesService {
    constructor(
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>,
        @InjectRepository(DeviceUsage)
        private readonly deviceUsageRepository: Repository<DeviceUsage>,
        @InjectRepository(Location)
        private readonly locationRepository: Repository<Location>,
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>
    ) { }

    async getDeviceUtilization(deviceType: string, organizationFhirId: string): Promise<DeviceUtilizationResult> {


        // 2. Filter and count distinct devices from the deviceUsage
        const distinctDevicesUsed = await this.deviceUsageRepository
            .createQueryBuilder('deviceUsage')
            .innerJoin('deviceUsage.device', 'device')
            .innerJoin('device.owner', 'owner')
            .where('deviceUsage.status = :status', { status: 'Active' })
            .andWhere('device.type = :deviceType', { deviceType })
            .andWhere('owner.fhirId = :organizationFhirId', { organizationFhirId })
            .select('COUNT(DISTINCT device.id)', 'count')
            .getRawOne()
            .then(result => parseInt(result.count));

        // 3. Get all devices of the input type from Device Repo filtered by owner
        const totalDevices = await this.deviceRepository
            .createQueryBuilder('device')
            .innerJoin('device.owner', 'owner')
            .where('device.type = :deviceType', { deviceType })
            .andWhere('owner.fhirId = :organizationFhirId', { organizationFhirId })
            .getCount();

        // 4. Calculate utilization- devices used/ total devices *100
        const utilization = totalDevices > 0 ? (distinctDevicesUsed / totalDevices) * 100 : 0;

        return {
            distinctDevicesUsed,
            totalDevices,
            utilization: Math.round(utilization * 100) / 100, // Round to 2 decimal places
            deviceType,
            organizationFhirId,
        };
    }
}
