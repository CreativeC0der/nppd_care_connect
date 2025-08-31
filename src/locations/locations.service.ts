import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Location } from './entities/location.entity';
import { Encounter } from '../encounters/entities/encounter.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { LocationUtilizationDto } from './dto/location-utilization.dto';
import { CreateLocationDto } from './dto/create-location.dto';

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

    async createLocation(createLocationDto: CreateLocationDto): Promise<Location> {
        const {
            partOfFhirId,
            organizationFhirId,
            ...locationData
        } = createLocationDto;

        // Create new location instance
        const location = this.locationRepository.create(locationData);

        // Handle partOf relationship if locationFhirId is provided
        if (partOfFhirId) {
            const parentLocation = await this.locationRepository.findOne({
                where: { fhirId: partOfFhirId }
            });
            if (!parentLocation) {
                throw new NotFoundException(`Parent location with FHIR ID ${partOfFhirId} not found`);
            }
            location.partOf = parentLocation;
        }

        const organization = await this.organizationRepository.findOne({
            where: { fhirId: organizationFhirId }
        });
        if (!organization) {
            throw new NotFoundException(`Organization with FHIR ID ${organizationFhirId} not found`);
        }
        location.organization = organization;

        // Save and return the created location
        return this.locationRepository.save(location);
    }

    async getLocationUtilization(params: LocationUtilizationDto): Promise<LocationUtilizationResult> {
        const { type, form, organizationFhirId } = params;

        const organization = await this.organizationRepository.findOne({
            where: { fhirId: organizationFhirId }
        });
        if (!organization) {
            throw new NotFoundException(`Organization with FHIR ID ${organizationFhirId} not found`);
        }

        const result = await this.locationRepository.query(
            `--sql
            SELECT
                (SELECT COUNT(*) 
                    FROM encounters enc
                    INNER JOIN locations loc ON enc.location = loc.id
                    INNER JOIN organization org ON enc."serviceProvider" = org.id
                    WHERE enc.status = $1
                        AND loc.type = $2
                        AND loc.form = $3
                        AND org."managing_organization" = $4
                ) AS "encounterCount",
                (SELECT COUNT(*) FROM locations loc
                    INNER JOIN organization org ON loc.organization_id = org.id
                    WHERE loc.type = $2
                        AND loc.form = $3
                        AND org.id = $4
                ) AS "locationCount"
            `,
            ['in-progress', type, form, organization.id]
        );
        const encounterCount = parseInt(result[0].encounterCount, 10);
        const locationCount = parseInt(result[0].locationCount, 10);

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

    async getAllLocations(organizationFhirId: string): Promise<Location[]> {
        return this.locationRepository.find({
            where: [
                {
                    organization: {
                        fhirId: organizationFhirId
                    }
                },
                {
                    organization: {
                        managingOrganization: {
                            fhirId: organizationFhirId
                        }
                    }
                }
            ]
        });
    }

    async getLocationById(id: string): Promise<Location | null> {
        return this.locationRepository.findOne({
            where: { id },
            relations: ['organization', 'healthcareService', 'partOf', 'subLocations'],
        });
    }

    async getRootLocationsWithSubLocations(organizationFhirId: string): Promise<Location[]> {
        return this.locationRepository.find({
            where: {
                partOf: IsNull(),
                organization: {
                    fhirId: organizationFhirId
                }
            },
            relations: [
                'subLocations',
            ],
        });
    }
} 