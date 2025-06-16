
import {
    IsString,
    IsDateString,
    IsArray,
    ValidateNested,
    IsOptional,
}
    from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CareplanActivityDto } from './cp_activity.dto';



export class CreateCareplanDto {
    @ApiProperty({ example: 'cp-001', description: 'Unique identifier for the care plan' })
    @IsString()
    fhirId: string;

    @ApiProperty({ example: 'Plan for managing type 2 diabetes', description: 'Description of the care plan', required: false })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty({ example: 'active', description: 'Status of the care plan (e.g., active, completed, cancelled)' })
    @IsString()
    status: string;

    @ApiProperty({ example: 'goal', description: 'Intent of the care plan (e.g., proposal, plan, order)' })
    @IsString()
    intent: string;

    @ApiProperty({ example: '2023-10-26T00:00:00Z', description: 'Start date of the care plan' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2024-10-26T00:00:00Z', description: 'End date of the care plan', required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ description: 'Activities included in the care plan', type: [CareplanActivityDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CareplanActivityDto)
    activities: CareplanActivityDto[];

    @ApiProperty({ example: 'patient-123', description: 'FHIR ID of the patient associated with the care plan' })
    @IsString()
    patientFhirId: string;

    @ApiProperty({ example: 'encounter-789', description: 'FHIR ID of the encounter associated with the care plan', required: false })
    @IsOptional()
    @IsString()
    encounterFhirId?: string;

    @ApiProperty({ example: ['condition-abc', 'condition-def'], description: 'Array of FHIR IDs of conditions associated with the care plan', required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    conditionFhirIds?: string[];
}
