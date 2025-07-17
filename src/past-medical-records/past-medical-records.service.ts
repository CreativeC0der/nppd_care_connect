import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as FormData from 'form-data';
import axios from 'axios';
import * as fs from 'fs';
import { MedicalRecord, MedicalRecordType } from './entities/past-medical-record.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';

@Injectable()
export class PastMedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepo: Repository<MedicalRecord>,
    @InjectRepository(Encounter)
    private readonly encounterRepo: Repository<Encounter>,

  ) { }

  async processImageFiles(encounterFhirId: string, files: Express.Multer.File[]): Promise<MedicalRecord[]> {
    const results: MedicalRecord[] = [];

    for (const file of files) {
      try {
        const form = new FormData();
        const fileStream = fs.createReadStream(file.path);
        form.append('file', fileStream, file.originalname);

        const encounter = await this.encounterRepo.findOneBy({ fhirId: encounterFhirId });
        if (!encounter)
          throw new NotFoundException("Encounter Not Found")

        const { data } = await axios.post('http://localhost:3001/analyze-image', form, {
          headers: form.getHeaders(),
        });

        const response = data.response

        const record = this.medicalRecordRepo.create({
          fhirId: `mr-${Date.now()}-${Math.floor(Math.random() * 10000)}`, // generate a unique ID
          type: response.type ?? MedicalRecordType.OTHER,
          title: response.title ?? file.originalname,
          date: response.date,
          issuer: response.issuer ?? null,
          tags: response.tags ?? [],
          summary: response.summary ?? '',
          data: response.data, // save entire parsed result
          encounter: encounter
        });

        await this.medicalRecordRepo.save(record);
        results.push(record);

        // Optionally delete the file after processing
        fs.unlink(file.path, () => { });
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error.message);
        throw new BadRequestException(`Failed to analyze ${file.originalname}`);
      }
    }

    return results;
  }

  async findByEncounterFhirId(encounterFhirId: string): Promise<MedicalRecord[]> {
    const encounter = await this.encounterRepo.findOne({
      where: { fhirId: encounterFhirId },
    });
    if (!encounter) throw new NotFoundException('Encounter not found');

    return this.medicalRecordRepo.find({
      where: { encounter: { id: encounter.id } },
      order: { date: 'DESC' },
    });
  }

}
