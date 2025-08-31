import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, In, Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { PatientRole } from './entities/patient-role.entity';
import { HttpService } from '@nestjs/axios';
import { CreatePatientDto } from './dto/create_patient.dto';
import { FirebaseConfig } from 'src/Utils/config/firebase.config';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
        @InjectRepository(PatientRole)
        private patientRoleRepository: Repository<PatientRole>,
        private httpService: HttpService,
        private firebaseConfig: FirebaseConfig,
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,
    ) { }

    async createPatient(patientData: CreatePatientDto) {
        try {
            const existingPatient = await this.patientRepository.findOne({
                where: {
                    fhirId: patientData.fhirId
                }
            });
            if (existingPatient)
                throw new BadRequestException('Patient Already Exists');

            // Verify organization exists
            const organization = await this.organizationRepository.findOne({
                where: { fhirId: patientData.organizationFhirId }
            });
            if (!organization) {
                throw new BadRequestException('Organization not found');
            }

            let firebaseUid: string | undefined = undefined;
            if (patientData.firebaseToken) {
                try {
                    const decoded = await this.firebaseConfig.getAuth().verifyIdToken(patientData.firebaseToken);
                    firebaseUid = decoded.uid;
                } catch (e) {
                    throw new UnauthorizedException('Invalid Firebase token');
                }
            }

            // Create patient
            const newPatient = this.patientRepository.create({ ...patientData, firebaseUid });
            const savedPatient = await this.patientRepository.save(newPatient);

            // Create patient role
            const patientRole = this.patientRoleRepository.create({
                patient: savedPatient,
                organization: organization,
                status: 'active'
            });
            await this.patientRoleRepository.save(patientRole);

            return savedPatient;
        } catch (error) {
            console.error('Error creating patient:', error);
            throw new BadRequestException('Failed to create patient');
        }
    }

    async getAllPatients(organizationFhirId: string, practitionerId?: string): Promise<Patient[]> {
        const distinctPatients = await this.patientRepository
            .createQueryBuilder('patient')
            .innerJoin('patient.patientRoles', 'patientRole')
            .innerJoin('patientRole.organization', 'organization')
            .where('organization.fhirId = :orgId', { orgId: organizationFhirId })
            .select('patient')
            .distinct(true)
            .getMany();

        return distinctPatients;
    }

    async getPatientsByPractitioner(organizationFhirId: string, practitionerId: string): Promise<Patient[]> {
        const organization = await this.organizationRepository.findOne({
            where: { fhirId: organizationFhirId }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        const distinctPatients: Patient[] = await this.patientRepository.createQueryBuilder('patient')
            .innerJoin('patient.encounters', 'encounter')
            .innerJoin('encounter.serviceProvider', 'serviceProvider')
            .innerJoin('encounter.practitioners', 'practitioner')
            .where('serviceProvider.managingOrganization = :orgId', { orgId: organization.id })
            .andWhere('practitioner.id = :practitionerId', { practitionerId })
            .select(['patient'])
            .distinct(true)
            .getMany();

        return distinctPatients;
    }

}
