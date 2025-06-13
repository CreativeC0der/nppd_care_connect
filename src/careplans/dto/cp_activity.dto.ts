import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

export class CareplanActivityDto {
    @ApiProperty({ example: 'Take medication twice daily', description: 'Text instruction for the activity', required: false })
    @IsOptional()
    @IsString()
    detailText?: string; // Corresponds to detailText in the entity

    @ApiProperty({ example: 'scheduled', description: 'Status of the activity (e.g., scheduled, in-progress, completed)', required: false })
    @IsOptional()
    @IsString()
    status?: string; // Corresponds to status in the entity
}