import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsDateString,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class CreateScheduleDto {
    @ApiProperty({ example: 'fhir-123', description: 'FHIR identifier for the schedule' })
    @IsString()
    fhirId: string;

    @ApiProperty({ example: true, description: 'Whether the schedule is active' })
    @IsBoolean()
    active: boolean;

    @ApiProperty({ example: 'General Practice', required: false })
    @IsOptional()
    @IsString()
    serviceCategory?: string;

    @ApiProperty({ example: 'Consultation', required: false })
    @IsOptional()
    @IsString()
    serviceType?: string;

    @ApiProperty({ example: 'Cardiology', required: false })
    @IsOptional()
    @IsString()
    specialty?: string;

    @ApiProperty({ example: 'Morning Shift', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: '2025-06-10T09:00:00Z', required: true })
    @IsDate()
    @Type(() => Date)
    planningHorizonStart: Date;

    @ApiProperty({ example: '2025-06-10T17:00:00Z', required: true })
    @IsDate()
    @Type(() => Date)
    planningHorizonEnd: Date;

    @ApiProperty({ example: 'Available for morning consultations', required: false })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Practitioner UUID' })
    @IsString()
    practitionerFhirId: string;
}
