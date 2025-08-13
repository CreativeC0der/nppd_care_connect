import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LocationUtilizationDto {
    @ApiProperty({
        description: 'Location type (e.g., emergency-room, operating-room, ward)',
        example: 'emergency-room'
    })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({
        description: 'Location form (e.g., building, floor, room)',
        example: 'building'
    })
    @IsString()
    @IsNotEmpty()
    form: string;

    @ApiProperty({
        description: 'Organization FHIR ID',
        example: 'hospital-a'
    })
    @IsString()
    @IsNotEmpty()
    organizationFhirId: string;
} 