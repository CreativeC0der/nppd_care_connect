import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicationStatus, MedicationDoseForm } from '../entities/medication.entity';

class MedicationIngredientDto {
    @ApiProperty({ example: 'Paracetamol' })
    @IsString()
    item: string;

    @ApiProperty({ example: '500mg' })
    @IsString()
    value: string;
}

export class CreateMedicationDto {
    @ApiProperty({ example: 'med-001' })
    @IsString()
    fhirId: string;

    @ApiPropertyOptional({ example: 'Acetaminophen' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({ enum: MedicationStatus })
    @IsOptional()
    @IsEnum(MedicationStatus)
    status?: MedicationStatus;

    @ApiPropertyOptional({ enum: MedicationDoseForm })
    @IsOptional()
    @IsEnum(MedicationDoseForm)
    doseForm?: MedicationDoseForm;

    @ApiPropertyOptional({ example: 100 })
    @IsOptional()
    @IsNumber()
    totalVolumeValue?: number;

    @ApiPropertyOptional({ example: 'mL' })
    @IsOptional()
    @IsString()
    totalVolumeUnit?: string;

    @ApiPropertyOptional({
        type: [MedicationIngredientDto],
        example: [{ item: 'Paracetamol', value: '500mg' }],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MedicationIngredientDto)
    ingredient?: MedicationIngredientDto[];

    @ApiPropertyOptional({ example: 'BATCH12345' })
    @IsOptional()
    @IsString()
    batchLotNumber?: string;

    @ApiPropertyOptional({ example: '2025-12-31T00:00:00Z' })
    @IsOptional()
    @IsDateString()
    batchExpirationDate?: string;
}
