import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export enum EncounterStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in-progress',
    ON_HOLD = 'on-hold',
    DISCHARGED = 'discharged',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    DISCONTINUED = 'discontinued',
    ENTERED_IN_ERROR = 'entered-in-error',
    UNKNOWN = 'unknown',
}

export class CreateEncounterDto {
    @ApiProperty({
        description: 'The FHIR ID of the encounter',
        example: 'encounter-123',
    })
    @IsString()
    @IsNotEmpty()
    fhirId: string;

    @ApiProperty({
        description: 'The status of the encounter',
        example: 'scheduled',
    })
    @IsString()
    @IsEnum(EncounterStatus)
    status: EncounterStatus;

    @ApiProperty({
        description: 'The type of the encounter',
        example: 'ambulatory',
        required: false,
    })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiProperty({
        description: 'The reason for the encounter',
        example: 'Annual checkup',
        required: false,
    })
    @IsString()
    @IsOptional()
    reason?: string;

    @ApiProperty({
        description: 'The start time of the encounter',
        example: '2023-06-15T10:00:00Z',
        required: false,
    })
    @IsDateString()
    start?: Date;

    @ApiProperty({
        description: 'The end time of the encounter',
        example: '2023-06-15T11:30:00Z',
        required: false,
    })
    @IsDateString()
    end?: Date;

    @ApiProperty({
        description: 'The ID of the patient associated with this encounter',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    patientFhirId?: string;

    @ApiProperty({
        description: 'The IDs of practitioners involved in this encounter',
        example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
        required: false,
        type: [String],
    })
    @IsString({ each: true })
    @IsOptional()
    practitionerFhirIds: string[];

    @ApiProperty({
        description: 'Appointment FHIR ID',
        example: 'app-001',
        required: true,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    appointmentFhirId: string;
}