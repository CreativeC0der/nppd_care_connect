import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { Repository } from 'typeorm';
import { ServiceRequest } from './entities/service-request.entity';

@Injectable()
export class ServiceRequestsService {

  constructor(
    @InjectRepository(ServiceRequest)
    private readonly serviceRequestRepo: Repository<ServiceRequest>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(Encounter)
    private readonly encounterRepo: Repository<Encounter>,

    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
  ) { }

  async createServiceRequests(dto: CreateServiceRequestDto) {
    const patient = await this.patientRepo.findOneBy({ fhirId: dto.subjectFhirId });
    if (!patient) throw new BadRequestException('Patient not found');

    const requester = await this.practitionerRepo.findOneBy({ fhirId: dto.requesterFhirId });
    if (!requester) throw new BadRequestException('Requester not found');

    let encounter;
    if (dto.encounterFhirId) {
      encounter = await this.encounterRepo.findOneBy({
        fhirId: dto.encounterFhirId,
        patient: { id: patient.id },
      });
      if (!encounter) throw new BadRequestException('Encounter not found');
    }

    const serviceRequests = dto.requests.map(req =>
      this.serviceRequestRepo.create({
        ...req,
        subject: patient,
        initiatedByEncounter: encounter,
        requester,
        authoredOn: dto.authoredOn,
      }),
    );

    return this.serviceRequestRepo.save(serviceRequests);
  }

}
