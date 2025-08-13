import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create_organization.dto';
import { Admin } from 'src/admin/entities/admin.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
    ) { }

    async createOrganization(organizationData: CreateOrganizationDto): Promise<Organization> {
        const existingOrganization = await this.organizationRepository.findOne({
            where: {
                fhirId: organizationData.fhirId
            }
        });

        if (existingOrganization) {
            throw new BadRequestException('Organization Already Exists');
        }

        const parentOrganization = await this.organizationRepository.findOne({
            where: {
                fhirId: organizationData.partOf
            }
        });

        const managingOrganization = await this.organizationRepository.findOne({
            where: {
                fhirId: organizationData.managingOrganization
            }
        });

        // If the organization has a parent organization or a managing organization, but neither are found, throw an error
        if ((organizationData.partOf && !parentOrganization) || (organizationData.managingOrganization && !managingOrganization)) {
            throw new NotFoundException('Parent Organization or Managing Organization not found');
        }

        const newOrganization = this.organizationRepository.create({
            ...organizationData,
            parentOrganization: organizationData.partOf ? parentOrganization : null,
            managingOrganization: organizationData.managingOrganization ? managingOrganization : null
        });

        return this.organizationRepository.save(newOrganization);
    }

    async getAllOrganizations(): Promise<Organization[]> {
        return this.organizationRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['admins']
        });
    }

    async getOrganizationById(id: string): Promise<Organization> {
        const organization = await this.organizationRepository.findOne({
            where: { id }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        return organization;
    }

    async getOrganizationByFhirId(fhirId: string): Promise<Organization> {
        const organization = await this.organizationRepository.findOne({
            where: { fhirId }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        return organization;
    }

    async updateOrganization(id: string, updateData: Partial<CreateOrganizationDto>): Promise<Organization> {
        const organization = await this.getOrganizationById(id);

        Object.assign(organization, updateData);
        return this.organizationRepository.save(organization);
    }

    async deleteOrganization(id: string): Promise<void> {
        const organization = await this.getOrganizationById(id);
        await this.organizationRepository.remove(organization);
    }

    async getOrganizationByAdminFhirId(adminFhirId: string): Promise<Organization[]> {
        const admin = await this.adminRepository.findOne({
            where: { fhirId: adminFhirId },
            relations: ['organization']
        });

        if (!admin) {
            throw new NotFoundException('Admin not found');
        }

        if (!admin.organization) {
            throw new NotFoundException('Admin does not belong to any organization');
        }

        return [admin.organization];
    }

    async getOrganizationByPatientFhirId(patientFhirId: string): Promise<Organization[]> {
        const serviceProviders: Organization[] = await this.encounterRepository
            .createQueryBuilder('encounter')
            .innerJoinAndSelect('encounter.serviceProvider', 'organization') // load the entity
            .innerJoin('encounter.patient', 'patient')
            .where('patient.fhirId = :patientFhirId', { patientFhirId })
            .distinct(true) // ensures distinct results
            .select(['organization']) // select only organization entity
            .getRawMany();

        if (serviceProviders.length === 0) {
            throw new NotFoundException('Patient not found');
        }

        return serviceProviders;
    }

    async getOrganizationByPractitionerFhirId(practitionerFhirId: string): Promise<Organization[]> {
        const serviceProviders: Organization[] = await this.encounterRepository
            .createQueryBuilder('encounter')
            .innerJoinAndSelect('encounter.serviceProvider', 'organization') // load the entity
            .innerJoin('encounter.practitioners', 'practitioner')
            .where('practitioner.fhirId = :practitionerFhirId', { practitionerFhirId })
            .distinct(true) // ensures distinct results
            .select(['organization']) // select only organization entity
            .getRawMany();

        if (serviceProviders.length === 0) {
            throw new NotFoundException('Practitioner not found');
        }

        return serviceProviders;
    }
} 