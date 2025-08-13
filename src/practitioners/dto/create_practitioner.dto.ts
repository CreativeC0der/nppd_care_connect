import {
    IsOptional,
    IsString,
    IsDateString,
    IsBoolean,
    IsUUID,
    IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePractitionerDto {
    @ApiProperty({
        example: 'd5fE_asz-3421-44de-bb12-43ec9d6e8f5a',
        description: 'FHIR resource ID',
    })
    @IsString()
    fhirId: string;

    @ApiProperty({
        example: 'Dr.',
        description: 'Name prefix like Dr., Mr., Ms.',
        required: false,
    })
    @IsOptional()
    @IsString()
    prefix?: string;

    @ApiProperty({
        example: 'John',
        description: 'Given name of the practitioner',
    })
    @IsString()
    givenName: string;

    @ApiProperty({
        example: 'Doe',
        description: 'Family name of the practitioner',
        required: false,
    })
    @IsOptional()
    @IsString()
    familyName?: string;

    @ApiProperty({
        example: 'male',
        description: 'Gender of the practitioner',
        required: false,
    })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiProperty({
        example: '1980-03-15',
        description: 'Birthdate in YYYY-MM-DD format',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @ApiProperty({
        example: '+1234567890',
        description: 'Phone number',
        required: false,
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'Email address',
        required: false,
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({
        example: 'MD',
        description: 'Medical qualification or degree',
        required: false,
    })
    @IsOptional()
    @IsString()
    qualification?: string;

    @ApiProperty({
        example: true,
        description: 'Indicates whether the practitioner is active',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiProperty({ example: 'firebase_id_token', description: 'Firebase ID token', required: false })
    @IsOptional()
    @IsString()
    firebaseToken?: string;
}