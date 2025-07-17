import {
    IsUUID,
    IsDateString,
    IsArray,
    ValidateNested,
    IsOptional,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceRequestDto } from './service-request.dto';

export class CreateServiceRequestDto {
    @ApiProperty({ example: 'fhir-patient-uuid', description: 'Patient FHIR ID' })
    @IsString()
    subjectFhirId: string;

    @ApiPropertyOptional({ example: 'fhir-encounter-uuid', description: 'Encounter FHIR ID' })
    @IsOptional()
    @IsString()
    encounterFhirId?: string;

    @ApiPropertyOptional({ example: '2024-06-04T10:00:00Z', description: 'Date/time when the request was authored' })
    @IsOptional()
    @IsDateString()
    authoredOn?: string;

    @ApiPropertyOptional({ example: 'fhir-practitioner-uuid', description: 'Requester (Practitioner) FHIR ID' })
    @IsOptional()
    @IsString()
    requesterFhirId?: string;

    @ApiProperty({
        type: [ServiceRequestDto],
        description: 'Array of service request items',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ServiceRequestDto)
    requests: ServiceRequestDto[];
}
