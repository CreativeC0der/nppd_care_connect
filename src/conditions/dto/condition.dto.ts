import {
    IsEnum,
    IsOptional,
    IsString,
    IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClinicalStatus, VerificationStatus, ConditionSeverity } from '../entities/condition.entity';

export class ConditionDto {

    @ApiProperty({ example: 'cond-001' })
    @IsString()
    fhirId: string;

    @ApiProperty({ enum: ClinicalStatus })
    @IsEnum(ClinicalStatus)
    clinicalStatus: ClinicalStatus;

    @ApiPropertyOptional({ enum: VerificationStatus })
    @IsOptional()
    @IsEnum(VerificationStatus)
    verificationStatus?: VerificationStatus;

    @ApiPropertyOptional({ enum: ConditionSeverity })
    @IsOptional()
    @IsEnum(ConditionSeverity)
    severity?: ConditionSeverity;

    @ApiPropertyOptional({ example: 'Hypertension' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({ example: 'Left arm' })
    @IsOptional()
    @IsString()
    bodySite?: string;

    @ApiPropertyOptional({ example: '2025-06-01T10:00:00Z' })
    @IsOptional()
    @IsDateString()
    onsetDateTime?: string;

    @ApiPropertyOptional({ example: 'Patient reported dizziness' })
    @IsOptional()
    @IsString()
    note?: string;

    @ApiPropertyOptional({ example: '2025-07-04T08:00:00Z' })
    @IsOptional()
    @IsDateString()
    recordedDate?: string;
}
