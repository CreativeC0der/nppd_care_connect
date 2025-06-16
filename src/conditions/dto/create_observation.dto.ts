import { IsString, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateObservationDto {
    @ApiProperty({ example: 'a7d5243b-67e9-41cc-b7b3-3156a2c0fcfc', description: 'FHIR resource ID' })
    @IsString()
    fhirId: string;

    @ApiProperty({ example: 'final', description: 'Observation status' })
    @IsString()
    status: string;

    @ApiPropertyOptional({ example: 'Laboratory', description: 'Observation category display' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ example: 'MCHC [Mass/volume] by Automated count', description: 'Display name for the code' })
    @IsOptional()
    @IsString()
    code: string;

    @ApiPropertyOptional({ example: '2017-10-21T19:20:06+00:00', description: 'Date/time when observation was effective' })
    @IsOptional()
    @IsDateString()
    effectiveDateTime?: string;

    @ApiPropertyOptional({ example: '2017-10-21T19:20:06.629+00:00', description: 'Time when observation was issued' })
    @IsOptional()
    @IsDateString()
    issued?: string;

    @ApiPropertyOptional({ example: 35.74, description: 'Value of the observation' })
    @IsOptional()
    @IsNumber()
    value?: number;

    @ApiPropertyOptional({ example: 'g/dL', description: 'Unit of measurement' })
    @IsOptional()
    @IsString()
    unit?: string;

    @ApiProperty({ example: 'b50aa0b7-6f9c-4f64-bf79-bfb6ecfd65e3', description: 'Patient FHIR ID' })
    @IsUUID()
    patientFhirId: string;

    @ApiPropertyOptional({ example: '3b6c0a7a-dfb4-4424-9b71-cb452c20c92e', description: 'Encounter FHIR ID ' })
    @IsOptional()
    @IsUUID()
    encounterFhirId?: string;
}
