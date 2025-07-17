import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ObservationCategory, ObservationStatus } from '../entities/observation.entity';

export class ObservationDto {
    @ApiProperty({ example: 'a7d5243b-67e9-41cc-b7b3-3156a2c0fcfc', description: 'FHIR resource ID' })
    @IsString()
    fhirId: string;

    @ApiProperty({
        enum: ObservationStatus,
        description: 'FHIR Observation status',
        example: ObservationStatus.FINAL,
    })
    @IsEnum(ObservationStatus)
    status: ObservationStatus;

    @ApiProperty({
        enum: ObservationCategory,
        description: 'The category of the observation as defined by HL7',
        example: ObservationCategory.VITAL_SIGNS,
    })
    @IsEnum(ObservationCategory)
    category: ObservationCategory;

    @ApiPropertyOptional({ example: 'MCHC [Mass/volume] by Automated count', description: 'Display name for the code' })
    @IsOptional()
    @IsString()
    code: string;

    @ApiPropertyOptional({ example: '2017-10-21T19:20:06+00:00', description: 'Date/time when observation was effective' })
    @IsOptional()
    @IsDateString()
    effectiveDateTime?: string;

    @ApiPropertyOptional({ example: "35.74", description: 'Value of the observation' })
    @IsString()
    value?: string;

    @ApiPropertyOptional({ example: 'g/dL', description: 'Unit of measurement' })
    @IsString()
    unit?: string;
}
