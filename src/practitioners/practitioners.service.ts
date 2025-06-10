import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from './entities/practitioner.entity';
import { log } from 'console';


@Injectable()
export class PractitionersService {
    private fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Practitioner)
        private readonly practitionerRepo: Repository<Practitioner>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
    ) { }

    async fetchAndSavePractitioner(practitionerId: string) {
        let practitioner = await this.practitionerRepo.findOneBy({ fhirId: practitionerId });

        if (!practitioner) {
            const pRes = await firstValueFrom(this.httpService.get(`${this.fhirBase}/Practitioner/${practitionerId}`));
            const pData = pRes.data;

            const given = pData.name?.[0]?.given?.[0] || '';
            const family = pData.name?.[0]?.family || '';
            const prefix = pData.name?.[0]?.prefix?.[0] || '';
            const phone = pData.telecom?.find(t => t.system === 'phone')?.value;
            const email = pData.telecom?.find(t => t.system === 'email')?.value;
            const qualification = pData.qualification?.[0]?.code?.text;

            const newPractitioner = this.practitionerRepo.create({
                fhirId: pData.id,
                givenName: given,
                familyName: family,
                prefix,
                phone,
                email,
                gender: pData.gender,
                birthDate: pData.birthDate,
                qualification,
                active: pData.active ?? true,
            });

            practitioner = await this.practitionerRepo.save(newPractitioner);
        }
        return practitioner;
    }
}

