import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Questionnaire } from './entities/questionnaire.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { QuestionnaireResponse } from './entities/questionnaireResponse.entity';
import { CreateQuestionnaireResponseDto } from './dto/create-questionnaire-response.dto';
import { Organization } from 'src/organizations/entities/organization.entity';

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(QuestionnaireResponse)
    private readonly responseRepo: Repository<QuestionnaireResponse>,

    @InjectRepository(Questionnaire)
    private readonly questionnaireRepo: Repository<Questionnaire>,

    @InjectRepository(Encounter)
    private readonly encounterRepo: Repository<Encounter>,

    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,

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
    const [questionnaire, encounter] = await Promise.all([
      this.questionnaireRepo.findOne({ where: { fhirId: dto.questionnaireFhirId } }),
      dto.encounterFhirId ? this.encounterRepo.findOne({ where: { fhirId: dto.encounterFhirId } }) : null,
    ]);

    if (!questionnaire) throw new NotFoundException('Questionnaire not found');
    if (!encounter) throw new NotFoundException('Encounter not found');

    const response = this.responseRepo.create({
      fhirId: dto.fhirId,
      status: dto.status,
      authored: dto.authored ? new Date(dto.authored) : new Date(),
      items: dto.items,
      questionnaire,
      encounter,
      author: null
    });

    return await this.responseRepo.save(response);
  }

  async getAll(): Promise<Questionnaire[]> {
    return this.questionnaireRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async calculateNPSByDepartment(organizationFhirId: string): Promise<Array<{ department: string, npsScore: number }>> {
    try {

      const organization = await this.organizationRepo.findOne({ where: { fhirId: organizationFhirId } });
      if (!organization) throw new NotFoundException('Organization not found');

      const query = `--sql
        WITH extracted_nps AS (
          SELECT 
            qr."encounterId",
            (qr.items->0->'answer'->0->>'valueInteger')::int AS nps_score
          FROM questionnaire_response qr
          INNER JOIN questionnaire q ON qr."questionnaireId" = q.id
          WHERE qr.status = 'completed'
            AND q."fhirId" LIKE '%nps%'
        ),
        scored AS (
          SELECT 
            COALESCE(sp.name, 'Unknown') AS department,
            COUNT(CASE WHEN e_nps.nps_score >= 9 THEN 1 END) AS promoters,
            COUNT(CASE WHEN e_nps.nps_score BETWEEN 0 AND 6 THEN 1 END) AS detractors,
            COUNT(*) AS total_responses
          FROM extracted_nps e_nps
          INNER JOIN encounters e ON e_nps."encounterId" = e.id
          INNER JOIN organization sp ON e."serviceProvider" = sp.id
          WHERE e_nps.nps_score IS NOT NULL
            AND sp.managing_organization = '${organization.id}'
          GROUP BY sp.name
        )
        SELECT 
          department,
          ROUND(((promoters - detractors) * 100.0 / NULLIF(total_responses, 0)), 2) AS nps_score
        FROM scored
        ORDER BY nps_score DESC
      `;

      const result = await this.questionnaireRepo.query(query);

      if (!result || result.length === 0) {
        return [];
      }

      return result;

    } catch (error) {
      console.error('Failed to calculate NPS scores:', error);
      throw new InternalServerErrorException('Failed to calculate NPS scores');
    }
  }
}
