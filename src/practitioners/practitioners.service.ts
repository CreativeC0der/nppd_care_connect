import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Practitioner } from './entities/practitioner.entity';
import { CreatePractitionerDto } from './dto/create_practitioner.dto';
import { FirebaseConfig } from 'src/Utils/config/firebase.config';


@Injectable()
export class PractitionersService {
    private fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Practitioner)
        private readonly practitionerRepo: Repository<Practitioner>,
        private firebaseConfig: FirebaseConfig,
    ) { }

    async fetchAndSavePractitioner(practitionerId: string) {
        let existing = await this.practitionerRepo.findOneBy({ fhirId: practitionerId });

        const pRes = await firstValueFrom(this.httpService.get(`${this.fhirBase}/Practitioner/${practitionerId}`));
        const pData = pRes.data;

        const given = pData.name?.[0]?.given?.[0] || '';
        const family = pData.name?.[0]?.family || '';
        const prefix = pData.name?.[0]?.prefix?.[0] || '';
        const phone = pData.telecom?.find(t => t.system === 'phone')?.value;
        const email = pData.telecom?.find(t => t.system === 'email')?.value;
        const qualification = pData.qualification?.[0]?.code?.text;

        let newPractitioner = this.practitionerRepo.create({
            fhirId: pData.id,
            firstName: given,
            lastName: family,
            prefix,
            phone,
            email,
            gender: pData.gender,
            birthDate: pData.birthDate,
            qualification,
            active: pData.active ?? true,
        });

        if (existing)
            newPractitioner.id = existing.id

        const practitioner = await this.practitionerRepo.save(newPractitioner);

        return practitioner;
    }


    async createPractitioner(practitionerData: CreatePractitionerDto) {
        const existingPractitioner = await this.practitionerRepo.findOne({
            where: {
                fhirId: practitionerData.fhirId
            }
        });
        if (existingPractitioner)
            throw new BadRequestException('Practitioner Already Exists');
        let firebaseUid: string | undefined = undefined;
        if (practitionerData.firebaseToken) {
            try {
                const decoded = await this.firebaseConfig.getAuth().verifyIdToken(practitionerData.firebaseToken);
                firebaseUid = decoded.uid;
            } catch (e) {
                throw new UnauthorizedException('Invalid Firebase token');
            }
        }
        const newPractitioner = this.practitionerRepo.create({ ...practitionerData, firebaseUid });
        return this.practitionerRepo.save(newPractitioner)
    }
}
