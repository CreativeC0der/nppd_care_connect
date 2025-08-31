import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePatientDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'FHIR ID of the patient' })
    @IsString()
    fhirId: string;

    @ApiProperty({ example: 'John', description: 'First name of the patient' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the patient' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: '1990-01-01', description: 'Birth date of the patient' })
    @IsDateString()
    birthDate: string;

    @ApiProperty({ example: 'male', description: 'Gender of the patient' })
    @IsString()
    gender: string;

    @ApiProperty({ example: '123-456-7890', description: 'Phone number of the patient', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the patient', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: 'New York', description: 'City of the patient', required: false })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({ example: 'NY', description: 'State of the patient', required: false })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiProperty({ example: 'English', description: 'Preferred language of the patient', required: false })
    @IsOptional()
    @IsString()
    preferredLanguage?: string;

    @ApiProperty({ example: 'active', description: 'Status of the patient', enum: ['active', 'deceased'] })
    @IsString()
    status: 'active' | 'deceased';

    @ApiProperty({ example: '2023-01-01', description: 'Date of death of the patient', required: false })
    @IsOptional()
    dateOfDeath?: string;

    @ApiProperty({ example: 'firebase_id_token', description: 'Firebase ID token', required: false })
    @IsOptional()
    @IsString()
    firebaseToken?: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Organization ID to link the patient to', required: true })
    @IsString()
    organizationFhirId: string;
}