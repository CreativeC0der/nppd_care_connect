import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, IsArray, IsObject, IsJSON } from "class-validator";
import { MedicationRequestIntent, MedicationRequestStatus, MedicationRequestPriority } from "../entities/medication-request.entity";

export class MedicationRequestDto {
    @ApiProperty({ enum: MedicationRequestIntent })
    @IsEnum(MedicationRequestIntent)
    intent: MedicationRequestIntent;

    @ApiProperty({ enum: MedicationRequestStatus })
    @IsEnum(MedicationRequestStatus)
    status: MedicationRequestStatus;

    @ApiPropertyOptional({ enum: MedicationRequestPriority })
    @IsOptional()
    @IsEnum(MedicationRequestPriority)
    priority?: MedicationRequestPriority;

    @ApiPropertyOptional({ example: 'For headache' })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiPropertyOptional({ example: 'Take 1 tablet every 6 hours' })
    @IsOptional()
    @IsJSON()
    @Type(() => Object)
    doseInstruction?: any;

    @ApiPropertyOptional({
        example: { start: '2025-06-01T00:00:00Z', end: '2025-06-10T00:00:00Z' },
        description: 'Start and end period of medication dosage',
    })
    @IsOptional()
    @Type(() => Object)
    dosePeriod?: { start: string; end: string };

    @IsString()
    @ApiProperty({ example: 'med-123', description: 'Medication FHIR ID' })
    medicationFhirId: string;
}