import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { DeviceUsage } from './entities/device-usage.entity';
import { Location } from 'src/locations/entities/location.entity';
import { Organization } from 'src/organizations/entities/organization.entity';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceUtilizationResult {
    @ApiProperty({ description: 'Number of distinct devices used' })
    distinctDevicesUsed: number;

    @ApiProperty({ description: 'Total number of devices' })
    totalDevices: number;

    @ApiProperty({ description: 'Device utilization percentage' })
    utilization: number;

    @ApiProperty({ description: 'Type of device analyzed' })
    deviceType: string;

    @ApiProperty({ description: 'Organization FHIR ID' })
    organizationFhirId: string;

    constructor(
        distinctDevicesUsed: number,
        totalDevices: number,
        utilization: number,
        deviceType: string,
        organizationFhirId: string
    ) {
        this.distinctDevicesUsed = distinctDevicesUsed;
        this.totalDevices = totalDevices;
        this.utilization = utilization;
        this.deviceType = deviceType;
        this.organizationFhirId = organizationFhirId;
    }
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

        return new DeviceUtilizationResult(
            distinctDevicesUsed,
            totalDevices,
            Math.round(utilization * 100) / 100, // Round to 2 decimal places
            deviceType,
            organizationFhirId
        );
    }

    async getAllDevicesWithUsageAndLocation(organizationFhirId: string): Promise<any[]> {
        if (!organizationFhirId || organizationFhirId.trim() === '') {
            throw new Error('Organization FHIR ID is required');
        }

        const query = `SELECT 
                            row_to_json(devices.*) AS device,
                            row_to_json(locations.*) AS location,
                            row_to_json(latest_device_usage.*) AS latest_device_usage,
                            row_to_json(patients.*) AS patient
                        FROM devices
                        LEFT JOIN organization
                            ON organization.id = devices.owner_id
                        LEFT JOIN locations
                            ON locations.id = devices.location_id
                        LEFT JOIN LATERAL (
                            SELECT du.*
                            FROM device_usage du
                            WHERE du.device_id = devices.id
                            ORDER BY du.start DESC
                            LIMIT 1
                        ) latest_device_usage ON true
                        LEFT JOIN patients
                            ON patients.id = latest_device_usage.patient_id
                        WHERE organization."fhirId" = $1
            `;

        const result = await this.deviceRepository.query(query, [organizationFhirId]);

        return result;

    }
}
