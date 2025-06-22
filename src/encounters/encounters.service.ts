import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { Encounter } from './entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { PractitionersService } from 'src/practitioners/practitioners.service';
import { CreateEncounterDto } from './dto/create_encounter.dto';
import { Role } from 'src/Utils/enums/role.enum';
import { CancelEncounterDto } from './dto/cancel_encounter.dto';

@Injectable()
export class EncountersService {

    private readonly fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly http: HttpService,
        private readonly practitionerService: PractitionersService,
        @InjectRepository(Encounter) private encounterRepo: Repository<Encounter>,
        @InjectRepository(Patient) private patientRepo: Repository<Patient>,
        @InjectRepository(Practitioner) private practitionerRepo: Repository<Practitioner>,
    ) { }

    async fetchAndSaveEncounters(patientFhirId: string) {
        const url = `${this.fhirBase}/Encounter?subject=Patient/${patientFhirId}`;
        const response = await firstValueFrom(this.http.get(url));
        const entries = response.data?.entry || [];

        console.log('Encounters fetched')

        const patient = await this.patientRepo.findOne({ where: { fhirId: patientFhirId } });
        if (!patient) throw new Error('Patient not found');

        for (const entry of entries) {
            const resource = entry?.resource;
            const existing = await this.encounterRepo.findOne({ where: { fhirId: resource.id } });

            let encounter = this.encounterRepo.create({
                fhirId: resource?.id || '',
                status: resource?.status || '',
                type: resource.type?.[0]?.text ?? null,
                reason: resource.reasonCode?.[0]?.coding?.[0]?.display ?? null,
                start: resource.period?.start ? new Date(resource.period.start) : null,
                end: resource.period?.end ? new Date(resource.period.end) : null,
                patient
            });

            // Get the practitioner references from the encounter
            const practitionerIds: string[] = (resource.participant || [])
                .map(participant => participant.individual?.reference?.split('/')[1])
                .filter(Boolean);

            const practitioners: Practitioner[] = [];

            for (const practitionerId of practitionerIds) {
                const practitioner = await this.practitionerService.fetchAndSavePractitioner(practitionerId);
                practitioners.push(practitioner);
            }

            encounter.practitioners = practitioners;

            // Save the encounter
            if (existing)
                encounter.id = existing.id

            await this.encounterRepo.save(encounter);
        }

        console.log('Encounters and practitioners saved');
    }

    async createEncounter(dto: CreateEncounterDto, request: any): Promise<Encounter> {
        const { patientFhirId, practitionerFhirIds, ...encounterDto } = dto;

        // 1. Validate patient
        const patient = await this.patientRepo.findOne({ where: { fhirId: patientFhirId } });
        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        if (request.role == Role.PATIENT && request.user.fhirId !== patientFhirId)
            throw new BadRequestException('Patient cannot create encounters for another patient');

        // 2. Fetch all requested practitioners
        const practitioners = await this.practitionerRepo.find({
            where: { fhirId: In(practitionerFhirIds) },
            relations: ['encounters'],
        });

        if (practitioners.length !== practitionerFhirIds.length) {
            throw new BadRequestException('Some practitioners were not found');
        }

        // 3. Check availability for each practitioner
        for (const doc of practitioners) {
            const hasOverlap = doc.encounters.some(encounter => {
                const isActive = ['scheduled', 'in-progress'].includes(encounter.status);
                const overlaps =
                    new Date(encounter.start!) <= new Date(encounterDto.end!) &&
                    new Date(encounter.end!) >= new Date(encounterDto.start!);
                return isActive && overlaps;
            });

            if (hasOverlap) {
                throw new ConflictException(
                    `Practitioner ${doc.givenName} is not available during the requested period`,
                );
            }
        }

        // 4. Create the new encounter
        const encounter = this.encounterRepo.create({
            ...encounterDto,
            patient,
            practitioners
        });

        return this.encounterRepo.save(encounter);
    }

    async cancelEncounterByFhirId(fhirId: string, dto: CancelEncounterDto, user: { role: string; fhirId: string },) {
        const encounter = await this.encounterRepo.findOne({
            where: { fhirId },
            relations: ['patient'],
        });

        // Check if encounter exists
        if (!encounter)
            throw new NotFoundException('Encounter not found');

        // Only the owner patient or an admin can cancel
        if (user.role === Role.PATIENT && encounter.patient.fhirId !== user.fhirId)
            throw new ForbiddenException('You cannot cancel another patient encounter');

        // Error if encounter is already cancelled
        if (encounter.status === 'cancelled')
            throw new BadRequestException('Encounter is already cancelled');

        // Update status
        encounter.status = 'cancelled';

        // Optionally store cancellation reason
        if (dto.reason)
            encounter.reason = `CANCELLED: ${dto.reason}`;

        return this.encounterRepo.save(encounter);
    }



}

