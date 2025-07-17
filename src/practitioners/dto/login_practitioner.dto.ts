import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { CreatePractitionerDto } from './create_practitioner.dto';
import { Type } from 'class-transformer';

export class LoginPractitionerDto extends PickType(CreatePractitionerDto, ['fhirId']) {
    @IsOptional()
    @ApiProperty({ description: 'OTP', example: 123456 })
    @Type(() => Number)
    @IsNumber()
    otp: number;
}