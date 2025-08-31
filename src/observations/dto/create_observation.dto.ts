// bulk-create-observation.dto.ts
import { Type } from 'class-transformer';
import {
    ValidateNested,
    ArrayNotEmpty,
    IsUUID,
    IsOptional,
    IsDateString,
    IsString,
    IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ObservationDto } from './observation.dto';

export class CreateObservationDto {
    @ApiProperty({ example: 'b50aa0b7-6f9c-4f64-bf79-bfb6ecfd65e3', description: 'Patient FHIR ID (subject)' })
    @IsString()
    subjectFhirId: string;

    @ApiPropertyOptional({ example: '3b6c0a7a-dfb4-4424-9b71-cb452c20c92e', description: 'Encounter FHIR ID' })
    @IsString()
    @IsNotEmpty()
    encounterFhirId: string;

    @ApiPropertyOptional({ example: '2025-06-04T10:30:00Z', description: 'Timestamp when all observations were issued' })
    @IsOptional()
    @IsDateString()
    issued?: string;

    @ApiProperty({
        type: [ObservationDto],
        description: 'List of observations (excluding patient, encounter, issued)',
    })
    @ValidateNested({ each: true })
    @Type(() => ObservationDto)
    @ArrayNotEmpty()
    observations: ObservationDto[];
}
