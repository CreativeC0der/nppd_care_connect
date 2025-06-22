import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelEncounterDto {
    @ApiProperty({
        description: 'Optional reason for cancelling the encounter',
        example: 'Feeling better, no longer need consultation',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    reason?: string;
}
