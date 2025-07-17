import { IsDate, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetSchedulesDto {
    @Type(() => Date)
    @IsDate()
    start: Date;

    @Type(() => Date)
    @IsDate()
    end: Date;

    @IsString()
    specialty: string;
}
