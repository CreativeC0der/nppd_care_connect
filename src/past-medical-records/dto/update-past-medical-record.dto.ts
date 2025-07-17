import { PartialType } from '@nestjs/swagger';
import { CreatePastMedicalRecordDto } from './create-past-medical-record.dto';

export class UpdatePastMedicalRecordDto extends PartialType(CreatePastMedicalRecordDto) {}
