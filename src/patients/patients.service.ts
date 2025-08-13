import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { HttpService } from '@nestjs/axios';
import { CreatePatientDto } from './dto/create_patient.dto';
import { FirebaseConfig } from 'src/Utils/config/firebase.config';
import { Encounter } from 'src/encounters/entities/encounter.entity';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
        private httpService: HttpService,
        private firebaseConfig: FirebaseConfig,
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
    ) { }

    async createPatient(patientData: CreatePatientDto) {
        const existingPatient = await this.patientRepository.findOne({
            where: {
                fhirId: patientData.fhirId
            }
        });
        if (existingPatient)
            throw new BadRequestException('Patient Already Exists');
        let firebaseUid: string | undefined = undefined;
        if (patientData.firebaseToken) {
            try {
                const decoded = await this.firebaseConfig.getAuth().verifyIdToken(patientData.firebaseToken);
                firebaseUid = decoded.uid;
            } catch (e) {
                throw new UnauthorizedException('Invalid Firebase token');
            }
        }
        const newPatient = this.patientRepository.create({ ...patientData, firebaseUid });
        return this.patientRepository.save(newPatient)
    }


    async getAllPatients(organizationFhirId: string): Promise<Patient[]> {
        const distinctPatients = await this.encounterRepository
            .createQueryBuilder('encounter')
            .innerJoin('encounter.patient', 'patient')
            .innerJoin('encounter.serviceProvider', 'serviceProvider')
            .innerJoin('serviceProvider.managingOrganization', 'managingOrganization')
            .select('DISTINCT patient.id')
            .where('managingOrganization.fhirId = :orgId', { orgId: organizationFhirId })
            .getRawMany();

        const patients: Patient[] = await this.patientRepository.findBy({
            id: In(distinctPatients.map(p => p.id))
        });
        return patients;
    }
}
