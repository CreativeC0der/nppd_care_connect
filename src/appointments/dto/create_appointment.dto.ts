import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsUUID,
    IsArray,
    ArrayNotEmpty,
} from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
    @ApiProperty({
        description: 'FHIR ID for the appointment',
        example: 'appt-001',
    })
    @IsString()
    @IsNotEmpty()
    fhirId: string;

    @ApiPropertyOptional({
        description: 'Status of the appointment',
        enum: AppointmentStatus,
        default: AppointmentStatus.BOOKED,
    })
    @IsEnum(AppointmentStatus)
    @IsOptional()
    status?: AppointmentStatus;

    @ApiPropertyOptional({
        description: 'Service category of the appointment',
        example: 'General Practice',
    })
    @IsString()
    @IsOptional()
    serviceCategory?: string;

    @ApiPropertyOptional({
        description: 'Specialty for the appointment',
        example: 'Cardiology',
    })
    @IsString()
    @IsOptional()
    specialty?: string;

    @ApiPropertyOptional({
        description: 'Short description of the appointment',
        example: 'Routine follow-up consultation',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Reason for the appointment',
        example: 'Post-surgery checkup',
    })
    @IsString()
    @IsOptional()
    reason?: string;

    @ApiProperty({
        description: 'UUID of the patient',
        example: '94a8c3ae-16c3-4315-8e13-b9bd6d9a4022',
    })
    @IsString()
    @IsNotEmpty()
    patientFhirId: string;

    @ApiPropertyOptional({
        description: 'List of UUIDs of participating practitioners',
        example: ['550e8400-e29b-41d4-a716-446655440001'],
        type: [String],
    })
    @IsString({ each: true })
    @IsOptional()
    @IsArray()
    practitionerFhirIds?: string[];

    @ApiPropertyOptional({
        description: 'List of UUIDs of slots to link to this appointment',
        example: ['b0c7fa9e-8bd1-4db8-aeb7-e2ff8a5f317c'],
        type: [String],
    })
    @IsString({ each: true })
    @IsOptional()
    @IsArray()
    slotFhirIds?: string[];
}
