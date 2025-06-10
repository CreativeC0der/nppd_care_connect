import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { randomUUID } from 'crypto';
import { LoginPatientDto } from './dto/login_patient.dto';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/Utils/otp/otp.service';
import { CreatePatientDto } from './dto/create_patient.dto';
import { Role } from 'src/Utils/enums/role.enum';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
        private httpService: HttpService,
        private jwtService: JwtService,
        private otpService: OtpService
    ) { }

    async fetchAndStorePatient() {
        try {
            const url = `https://r4.smarthealthit.org/Patient/?_count=1`;

            const response = await lastValueFrom(this.httpService.get(url))
            const data = response.data.entry[0].resource;
            console.log('Patient Data retrieved:')

            let existingPatient = await this.patientRepository.findOne({
                where: { fhirId: data?.id },
            });

            if (existingPatient)
                throw new BadRequestException('Patient already exists')

            const identifier = data?.id || randomUUID();
            const nameObj = data.name?.[0] || {};
            const telecom = data.telecom || [];
            const address = data.address?.[0] || {};
            const language = data.communication?.[0]?.language?.text;

            const patient = this.patientRepository.create({
                fhirId: identifier,
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
            });

            await this.patientRepository.save(patient);
            return patient;
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error creating patient`);
        }

    }

    async loginPatient(loginData: LoginPatientDto) {
        // check for existing user
        const existingUser = await this.patientRepository.findOne({
            where: {
                fhirId: loginData.fhirId
            }
        })
        if (!existingUser)
            throw new UnauthorizedException(`${loginData.fhirId} Not Found`)

        if (!loginData.otp) {
            const name = `${existingUser.firstName} ${existingUser.lastName}`;
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
                const payload = { ...existingUser, role: Role.PATIENT }
                const accessToken = await this.jwtService.signAsync(payload);

                return {
                    message: 'OTP Valid',
                    data: { accessToken, existingUser }
                };
            }
            else
                throw new UnauthorizedException('Invalid OTP')
        }
    }

    async createPatient(patientData: CreatePatientDto) {
        const existingPatient = await this.patientRepository.findOne({
            where: {
                fhirId: patientData.fhirId
            }
        });
        if (existingPatient)
            throw new BadRequestException('Patient Already Exists');
        const newPatient = this.patientRepository.create({ ...patientData });
        return this.patientRepository.save(newPatient)
    }
}
