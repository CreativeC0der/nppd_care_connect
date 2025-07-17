import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsUUID, IsOptional, IsDateString, IsArray, ValidateNested, IsString } from "class-validator";
import { ConditionDto } from "./condition.dto";

export class CreateConditionDto {
    @ApiProperty({ example: 'pat-1234', description: 'Patient FHIR ID' })
    @IsString()
    subjectFhirId: string;

    @ApiPropertyOptional({ example: 'enc-5678', description: 'Encounter FHIR ID (optional)' })
    @IsOptional()
    @IsString()
    encounterFhirId: string;

    @ApiProperty({
        type: [ConditionDto],
        description: 'List of conditions to create',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConditionDto)
    conditions: ConditionDto[];
}
