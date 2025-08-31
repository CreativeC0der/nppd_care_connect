import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationStatus, LocationMode, LocationForm } from '../entities/location.entity';

export class CreateLocationDto {
    @ApiPropertyOptional({ description: 'FHIR ID for the location' })
    @IsOptional()
    @IsString()
    fhirId?: string;

    @ApiPropertyOptional({
        description: 'Status of the location',
        enum: LocationStatus,
        example: LocationStatus.ACTIVE
    })
    @IsOptional()
    @IsEnum(LocationStatus)
    status?: LocationStatus;

    @ApiPropertyOptional({ description: 'Name of the location' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Description of the location' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Mode of the location',
        enum: LocationMode,
        example: LocationMode.INSTANCE
    })
    @IsOptional()
    @IsEnum(LocationMode)
    mode?: LocationMode;

    @ApiPropertyOptional({ description: 'Type of the location' })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({ description: 'Contact information for the location' })
    @IsOptional()
    @IsString()
    contact?: string;

    @ApiPropertyOptional({ description: 'Address of the location' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        description: 'Form of the location',
        enum: LocationForm,
        example: LocationForm.ROOM
    })
    @IsOptional()
    @IsEnum(LocationForm)
    form?: LocationForm;

    @ApiPropertyOptional({
        description: 'FHIR ID of the parent location (partOf)',
        example: 'location-fhir-id-123'
    })
    @IsOptional()
    @IsString()
    partOfFhirId?: string;

    @ApiPropertyOptional({
        description: 'FHIR ID of the managing organization',
        example: 'org-fhir-id-456'
    })
    @IsString()
    organizationFhirId: string;
} 