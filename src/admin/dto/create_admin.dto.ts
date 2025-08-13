import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateAdminDto {
    @ApiProperty({ example: '1234567890', description: 'FHIR ID of the admin' })
    @IsString()
    fhirId: string;

    @ApiProperty({ example: 'John', description: 'First name of the admin' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the admin' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: 'admin@example.com', description: 'Email address of the admin' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123-456-7890', description: 'Phone number of the admin', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: true, description: 'Is the admin active?' })
    @IsBoolean()
    active: boolean;

    @ApiProperty({ example: 'firebase_id_token', description: 'Firebase ID token', required: false })
    @IsOptional()
    @IsString()
    firebaseToken?: string;

    @ApiProperty({ example: { users: ['read', 'write'], patients: ['read'] }, description: 'Admin permissions', required: false })
    @IsOptional()
    permissions?: object;

    @ApiProperty({ example: '1234567890', description: 'Organization ID of the admin', required: false })
    @IsOptional()
    @IsString()
    organizationId?: string;
} 