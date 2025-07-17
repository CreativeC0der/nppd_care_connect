import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from './entities/questionnaire.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { QuestionnaireResponse } from './entities/questionnaireResponse.entity';
import { CreateQuestionnaireResponseDto } from './dto/create-questionnaire-response.dto';

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(QuestionnaireResponse)
    private readonly responseRepo: Repository<QuestionnaireResponse>,

    @InjectRepository(Questionnaire)
    private readonly questionnaireRepo: Repository<Questionnaire>,

    @InjectRepository(Encounter)
    private readonly encounterRepo: Repository<Encounter>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
  ) { }

  async createQuestionnaire(dto: CreateQuestionnaireDto): Promise<Questionnaire> {
    const existing = await this.questionnaireRepo.findOne({
      where: { fhirId: dto.fhirId },
    });

    if (existing)
      throw new ConflictException('Questionnaire with this FHIR ID already exists');

    const newQuestionnaire = this.questionnaireRepo.create(dto);
    return this.questionnaireRepo.save(newQuestionnaire);
  }

  async createResponse(dto: CreateQuestionnaireResponseDto) {
    const [questionnaire, subject, encounter, author] = await Promise.all([
      this.questionnaireRepo.findOne({ where: { fhirId: dto.questionnaireFhirId } }),
      this.patientRepo.findOne({ where: { fhirId: dto.subjectFhirId } }),
      dto.encounterFhirId ? this.encounterRepo.findOne({ where: { fhirId: dto.encounterFhirId } }) : null,
      dto.authorFhirId ? this.practitionerRepo.findOne({ where: { fhirId: dto.authorFhirId } }) : null,
    ]);

    if (!questionnaire) throw new NotFoundException('Questionnaire not found');
    if (!subject) throw new NotFoundException('Patient (subject) not found');
    if (!encounter) throw new NotFoundException('Encounter not found');

    const response = this.responseRepo.create({
      fhirId: dto.fhirId,
      status: dto.status,
      authored: dto.authored ? new Date(dto.authored) : new Date(),
      items: dto.items,
      questionnaire,
      subject,
      encounter,
      author,
    });

    return await this.responseRepo.save(response);
  }

  async getAll(): Promise<Questionnaire[]> {
    return this.questionnaireRepo.find({
      order: { createdAt: 'DESC' },
    });
  }
}
