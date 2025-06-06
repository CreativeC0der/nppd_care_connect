import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Patient } from './entities/patient.entity';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { randomUUID } from 'crypto';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
        private httpService:HttpService
    ) { }

    async fetchAndStorePatient() {
        try {
            const url = `https://r4.smarthealthit.org/Patient/?_count=1`;

            const response = await lastValueFrom(this.httpService.get(url))
            const data = response.data.entry[0].resource;
            console.log('Patient Data retrieved')

            const identifier = data.identifier?.[0]?.value || randomUUID();
            const nameObj = data.name?.[0] || {};
            const telecom = data.telecom || [];
            const address = data.address?.[0] || {};
            const language = data.communication?.[0]?.language?.text;

            const patient = this.patientRepository.create({
                identifier,
                firstName: nameObj.given?.[0] || '',
                lastName: nameObj.family || '',
                birthDate: data.birthDate,
                gender: data.gender,
                phone: telecom.find(t => t.system === 'phone')?.value,
                email: telecom.find(t => t.system === 'email')?.value,
                city: address.city,
                state: address.state,
                preferredLanguage: language,
                active: data.active ?? true,
                deceased: !!data.deceasedDateTime || !!data.deceasedBoolean,
                dateOfDeath: data.deceasedDateTime,
                managingOrganizationId: data.managingOrganization?.reference?.split('/')?.[1],
            });

            await this.patientRepository.save(patient);
            return patient;
        }
        catch (err) {
            throw new InternalServerErrorException(`Error creating patient`);
        }

    }
}
