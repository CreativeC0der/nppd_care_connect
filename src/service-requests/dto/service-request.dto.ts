import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEnum, IsBoolean, IsOptional, IsDateString, IsArray, IsDate } from "class-validator";
import { ServiceRequestStatus, ServiceRequestIntent, ServiceRequestCategory, ServiceRequestPriority } from "../entities/service-request.entity";
import { Type } from "class-transformer";

export class ServiceRequestDto {
    @ApiProperty({ example: 'sr-001', description: 'FHIR resource ID' })
    @IsString()
    fhirId: string;

    @ApiProperty({ enum: ServiceRequestStatus, example: ServiceRequestStatus.ACTIVE })
    @IsEnum(ServiceRequestStatus)
    status: ServiceRequestStatus;

    @ApiProperty({ enum: ServiceRequestIntent, example: ServiceRequestIntent.ORDER })
    @IsEnum(ServiceRequestIntent)
    intent: ServiceRequestIntent;

    @ApiProperty({ enum: ServiceRequestCategory, example: ServiceRequestCategory.LABORATORY_PROCEDURE })
    @IsEnum(ServiceRequestCategory)
    category: ServiceRequestCategory;

    @ApiProperty({ enum: ServiceRequestPriority, example: ServiceRequestPriority.ROUTINE })
    @IsEnum(ServiceRequestPriority)
    priority: ServiceRequestPriority;

    @ApiProperty({ example: false, description: 'If the service should not be performed' })
    @IsBoolean()
    doNotPerform: boolean;

    @ApiPropertyOptional({ example: 'CBC Panel', description: 'The specific code or name of the service' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({ example: 'Patient has fever and fatigue', description: 'Reason for the service request' })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiProperty({
        type: [String],
        example: ['2024-07-01T10:00:00Z', '2024-07-01T14:00:00Z'],
        description: 'Array of ISO 8601 datetime strings',
    })
    @IsArray()
    @Type(() => Date)
    @IsDate({ each: true })
    occurrence: Date[];
}