import { Injectable, HttpException, HttpStatus, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Observation, ObservationInterpretation } from './entities/observation.entity';
import { CreateObservationDto } from 'src/observations/dto/create_observation.dto';
import { UpdateObservationDto } from './dto/update_observation.dto';
import { Role } from 'src/Utils/enums/role.enum';
import { Organization } from 'src/organizations/entities/organization.entity';

@Injectable()
export class ObservationsService {
    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly http: HttpService,
        @InjectRepository(Observation) private readonly observationRepo: Repository<Observation>,
        @InjectRepository(Patient) private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Encounter) private readonly encounterRepo: Repository<Encounter>,
        @InjectRepository(Organization) private readonly organizationRepo: Repository<Organization>,
    ) { }

    async fetchAndSaveObservations(patientFhirId: string) {

    }

    async createObservations(
        dto: CreateObservationDto,
        request: any,
    ): Promise<Observation[]> {
        const { subjectFhirId, encounterFhirId, issued, observations } = dto;

        // Restrict patient role to only their own observations
        if (
            request.user.role === Role.PATIENT &&
            request.user.fhirId !== subjectFhirId
        ) {
            throw new UnauthorizedException(
                'You are not authorized to create observations for this patient',
            );
        }

        // Fetch and validate patient
        const patient = await this.patientRepo.findOneBy({ fhirId: subjectFhirId });
        if (!patient) throw new BadRequestException('Patient not found');

        // Fetch and validate encounter if provided
        let encounter: Encounter | null;
        if (encounterFhirId) {
            encounter = await this.encounterRepo.findOne({
                where: {
                    fhirId: encounterFhirId,
                    patient: { id: patient.id },
                },
            });
            if (!encounter) throw new BadRequestException('Encounter not found');
        }

        // Map each observation
        const newObservations = observations.map((obsDto) =>
            this.observationRepo.create({
                ...obsDto,
                issued,
                patient,
                encounter,
            }),
        );

        // Save all observations at once
        return this.observationRepo.save(newObservations);
    }

    async updateObservation(fhirId: string, updateDto: UpdateObservationDto, request: any): Promise<Observation> {

        const observation = await this.observationRepo.findOne({
            where: { fhirId },
            relations: ['patient', 'encounter'],
        });

        if (!observation)
            throw new NotFoundException(`Observation with id ${fhirId} not found`);

        // Check authorization if patient is not allowed to create observation for another patient
        if (request.user.role == Role.PATIENT && request.user.fhirId != observation.patient.fhirId)
            throw new UnauthorizedException(`You are not authorized to update observation for this patient`);

        // Merge the existing observation with updateDto
        const updated = this.observationRepo.merge(observation, updateDto);

        return this.observationRepo.save(updated);
    }

    async getByEncounterFhirId(encounterFhirId: string): Promise<Observation[]> {
        const encounter = await this.encounterRepo.findOne({
            where: { fhirId: encounterFhirId },
        });

        if (!encounter) {
            throw new NotFoundException('Encounter not found');
        }

        return this.observationRepo.find({
            where: { encounter: { id: encounter.id } },
            order: { effectiveDateTime: 'DESC' },
        });
    }

    async getCriticalObservationsByPractitioner(organizationFhirId: string, practitionerId: string): Promise<Observation[]> {
        const organization = await this.organizationRepo.findOne({
            where: { fhirId: organizationFhirId }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }
        // Direct SQL query to get critical observations for all patients of a practitioner
        const criticalObservations = await this.observationRepo
            .createQueryBuilder('observation')
            .innerJoin('observation.patient', 'patient')
            .innerJoin('observation.encounter', 'encounter')
            .innerJoin('encounter.serviceProvider', 'serviceProvider')
            .innerJoin('encounter.practitioners', 'practitioner')
            .where('serviceProvider.managingOrganization = :organizationId', { organizationId: organization.id })
            .andWhere('practitioner.id = :practitionerId', { practitionerId })
            .andWhere('CAST(observation.interpretation AS TEXT) ILIKE :criticalPattern', { criticalPattern: '%critical%' })
            .select(['observation', 'patient'])
            .distinct(true)
            .getMany();

        // Transform raw results back to Observation entities
        return criticalObservations;
    }
}
