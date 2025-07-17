import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Practitioner } from './entities/practitioner.entity';
import { Role } from 'src/Utils/enums/role.enum';
import { LoginPractitionerDto } from './dto/login_practitioner.dto';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/Utils/otp/otp.service';
import { CreatePractitionerDto } from './dto/create_practitioner.dto';


@Injectable()
export class PractitionersService {
    private fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Practitioner)
        private readonly practitionerRepo: Repository<Practitioner>,
        private readonly otpService: OtpService,
        private readonly jwtService: JwtService
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

        if (existing)
            newPractitioner.id = existing.id

        const practitioner = await this.practitionerRepo.save(newPractitioner);

        return practitioner;
    }


    async loginPractitioner(loginData: LoginPractitionerDto) {
        // check for existing user
        const existingUser = await this.practitionerRepo.findOne({
            where: {
                fhirId: loginData.fhirId
            }
        })
        if (!existingUser)
            throw new UnauthorizedException(`Practitioner Not Found`);

        if (!loginData.otp) {
            const name = `${existingUser.givenName} ${existingUser.familyName}`;
            const email = existingUser.email;
            // generate otp
            const mailSent = await this.otpService.generateOtp(existingUser.email, name);
            if (mailSent)
                return {
                    message: 'OTP Sent to Email',
                    data: null
                };
            else
                throw new InternalServerErrorException('Error Sending OTP')
        }
        else {
            // validate otp
            const otpValid = await this.otpService.validateOtp(existingUser.email, loginData.otp);
            if (otpValid) {
                const payload = { ...existingUser, role: Role.DOCTOR }
                const accessToken = await this.jwtService.signAsync(payload);

                return {
                    message: 'OTP Valid',
                    data: existingUser,
                    accessToken
                };
            }
            else
                throw new UnauthorizedException('Invalid OTP')
        }
    }

    async createPractitioner(practitionerData: CreatePractitionerDto) {
        const existingPractitioner = await this.practitionerRepo.findOne({
            where: {
                fhirId: practitionerData.fhirId
            }
        });
        if (existingPractitioner)
            throw new BadRequestException('Practitioner Already Exists');
        const newPractitioner = this.practitionerRepo.create({ ...practitionerData });
        return this.practitionerRepo.save(newPractitioner)
    }
}
