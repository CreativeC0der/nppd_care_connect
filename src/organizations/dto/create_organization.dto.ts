import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrganizationType } from '../entities/organization.entity';

export class CreateOrganizationDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'FHIR ID of the organization' })
    @IsString()
    fhirId: string;

    @ApiProperty({ example: 'General Hospital', description: 'Name of the organization' })
    @IsString()
    name: string;

    @ApiProperty({ example: true, description: 'Is the organization active?', required: false })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiProperty({
        example: OrganizationType.HEALTHCARE_PROVIDER,
        description: 'Type of the organization',
        enum: OrganizationType,
        required: false
    })
    @IsOptional()
    @IsEnum(OrganizationType)
    type?: OrganizationType;

    @ApiProperty({ example: 'A leading healthcare provider', description: 'Description of the organization', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '{"phone": "123-456-7890", "email": "contact@hospital.com"}', description: 'Contact information in JSON format', required: false })
    @IsOptional()
    @IsString()
    contact?: string;

    @ApiProperty({ example: 'parent-org-id', description: 'Parent organization ID', required: false })
    @IsOptional()
    @IsString()
    partOf?: string;

    @ApiProperty({ example: 'Licensed healthcare provider', description: 'Qualifications of the organization', required: false })
    @IsOptional()
    @IsString()
    qualification?: string;

    @ApiProperty({ example: 'managing-org-id', description: 'Managing organization ID', required: false })
    @IsOptional()
    @IsString()
    managingOrganization?: string;
} 