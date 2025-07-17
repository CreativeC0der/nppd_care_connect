import {
    IsOptional,
    IsString,
    ValidateNested,
    IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicationRequestDto } from './medication-requests.dto';

export class CreateMedicationRequestDto {
    @ApiProperty({ example: 'med-req-001' })
    @IsString()
    fhirId: string;

    @ApiProperty({ type: [MedicationRequestDto] })
    @ValidateNested({ each: true })
    @Type(() => MedicationRequestDto)
    requests: MedicationRequestDto[];

    @ApiProperty({ example: 'patient-fhir-id', description: 'Patient FHIR ID' })
    @IsString()
    subjectFhirId: string;

    @ApiPropertyOptional({ example: 'encounter-fhir-id', description: 'Encounter FHIR ID' })
    @IsOptional()
    @IsString()
    encounterFhirId?: string;

    @ApiProperty({ example: 'practitioner-fhir-id', description: 'Practitioner FHIR ID (Requester)' })
    @IsString()
    requesterFhirId: string;

    @ApiPropertyOptional({ example: '2025-06-01T10:00:00Z', description: 'Date of authoring' })
    @IsOptional()
    @IsDateString()
    authoredOn?: string;
}
