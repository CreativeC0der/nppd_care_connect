import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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

    private dataSource: DataSource,
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

  async calculateNPSByDepartment(): Promise<Array<{ department: string, npsScore: number }>> {
    try {
      const query = `
        SELECT 
          COALESCE(hs.name, 'Unknown') as department,
          ROUND(
            (
              (COUNT(CASE WHEN CAST(qr.items->>'score' AS INTEGER) >= 9 THEN 1 END) - 
               COUNT(CASE WHEN CAST(qr.items->>'score' AS INTEGER) <= 6 THEN 1 END)) * 100.0 / 
              NULLIF(COUNT(*), 0)
            ), 2
          ) as nps_score
        FROM questionnaire_response qr
        INNER JOIN encounters e ON qr.encounter_id = e.id
        INNER JOIN e.service_pro
        WHERE qr.status = 'completed'
          AND qr.items->>'score' IS NOT NULL
          AND CAST(qr.items->>'score' AS INTEGER) BETWEEN 0 AND 10
        GROUP BY hs.name
        ORDER BY nps_score DESC
      `;

      const result = await this.dataSource.query(query);

      if (!result || result.length === 0) {
        return [];
      }

      return result.map(row => ({
        department: row.department || 'Unknown',
        npsScore: parseFloat(row.nps_score) || 0
      })).filter(item => item.department !== 'Unknown' || item.npsScore !== 0);

    } catch (error) {
      console.error('Failed to calculate NPS scores:', error);
      return [];
    }
  }
}
