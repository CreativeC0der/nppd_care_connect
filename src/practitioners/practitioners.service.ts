import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Practitioner } from './entities/practitioner.entity';
import { CreatePractitionerDto } from './dto/create_practitioner.dto';
import { FirebaseConfig } from 'src/Utils/config/firebase.config';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

@Injectable()
export class PractitionersService {
    private fhirBase = 'https://r4.smarthealthit.org';

    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Practitioner)
        private readonly practitionerRepo: Repository<Practitioner>,
        @InjectRepository(Encounter)
        private readonly encounterRepo: Repository<Encounter>,
        @InjectRepository(Organization)
        private readonly organizationRepo: Repository<Organization>,
        private firebaseConfig: FirebaseConfig,
    ) { }

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

    async getPractitionersWithEncounterCounts(organizationFhirId: string) {
        // First validate that the organization exists
        const organization = await this.organizationRepo.findOne({
            where: { fhirId: organizationFhirId }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        // Execute the query to get practitioners with encounter counts
        const query = `--sql
                        SELECT 
                            row_to_json(p.*) AS practitioner,
                            json_agg(DISTINCT pr) AS practitioner_roles,
                            COUNT(ep.encounter_id) AS encounter_count
                        FROM practitioners p
                        LEFT JOIN encounter_practitioners ep ON ep.practitioner_id = p.id
                        LEFT JOIN practitioner_roles pr ON pr.practitioner_id = p.id
                        LEFT JOIN organization org ON org.id = pr.organization_id
                        --WHERE org.managing_organization = $1
                        GROUP BY p.id
                        ORDER BY encounter_count DESC `;

        return this.practitionerRepo.query(query);
    }
}
