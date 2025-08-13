import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create_admin.dto';
import { FirebaseConfig } from 'src/Utils/config/firebase.config';
import { Organization } from 'src/organizations/entities/organization.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        private firebaseConfig: FirebaseConfig,
        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,
    ) { }

    async createAdmin(adminData: CreateAdminDto) {
        const existingAdmin = await this.adminRepository.findOne({
            where: {
                fhirId: adminData.fhirId
            }
        });

        if (existingAdmin) {
            throw new BadRequestException('Admin with this fhirId already exists');
        }

        let firebaseUid: string | undefined = undefined;
        if (adminData.firebaseToken) {
            try {
                const decoded = await this.firebaseConfig.getAuth().verifyIdToken(adminData.firebaseToken);
                firebaseUid = decoded.uid;
            } catch (e) {
                throw new UnauthorizedException('Invalid Firebase token');
            }
        }

        let organization: Organization | null = null;
        if (adminData.organizationId) {
            organization = await this.organizationRepository.findOne({ where: { fhirId: adminData.organizationId } });
        }

        const newAdmin = this.adminRepository.create({
            ...adminData,
            firebaseUid,
            organization
        });

        return this.adminRepository.save(newAdmin);
    }
} 