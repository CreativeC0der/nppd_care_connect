import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { Encounter } from '../encounters/entities/encounter.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { LocationUtilizationDto } from './dto/location-utilization.dto';

export interface LocationUtilizationResult {
    encounterCount: number;
    locationCount: number;
    utilization: number;
    type: string;
    form: string;
    organizationFhirId: string;
}

@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location)
        private readonly locationRepository: Repository<Location>,
        @InjectRepository(Encounter)
        private readonly encounterRepository: Repository<Encounter>,
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
    ) { }

    async getLocationUtilization(params: LocationUtilizationDto): Promise<LocationUtilizationResult> {
        const { type, form, organizationFhirId } = params;

        // 1. Get encounters count with status='in-progress' and matching location type and form
        // Also ensure the encounter's service provider matches the organization
        const encounterCount = await this.encounterRepository
            .createQueryBuilder('encounter')
            .innerJoin('encounter.location', 'location')
            .innerJoin('encounter.serviceProvider', 'serviceProvider')
            .innerJoin('serviceProvider.managingOrganization', 'managingOrganization')
            .where('encounter.status = :status', { status: 'in-progress' })
            .andWhere('location.type = :type', { type })
            .andWhere('location.form = :form', { form })
            .andWhere('managingOrganization.fhirId = :organizationFhirId', { organizationFhirId })
            .getCount();

        // 2. Get count of all locations with matching managingOrganization, type and form
        const locationCount = await this.locationRepository
            .createQueryBuilder('location')
            .leftJoin('location.managingOrganization', 'managingOrganization')
            .where('location.type = :type', { type })
            .andWhere('location.form = :form', { form })
            .andWhere('managingOrganization.fhirId = :organizationFhirId', { organizationFhirId })
            .getCount();

        // 3. Calculate utilization percentage
        const utilization = locationCount > 0 ? (encounterCount / locationCount) * 100 : 0;

        return {
            encounterCount,
            locationCount,
            utilization: Math.round(utilization * 100) / 100, // Round to 2 decimal places
            type,
            form,
            organizationFhirId,
        };
    }

    async getAllLocations(): Promise<Location[]> {
        return this.locationRepository.find({
            relations: ['managingOrganization', 'healthcareService'],
        });
    }

    async getLocationById(id: string): Promise<Location | null> {
        return this.locationRepository.findOne({
            where: { id },
            relations: ['managingOrganization', 'healthcareService', 'partOf', 'subLocations'],
        });
    }
} 