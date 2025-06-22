import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { CreatePatientDto } from './create_patient.dto';
import { IsString, IsNumber, IsOptional, Length, Min, Max, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginPatientDto extends PickType(CreatePatientDto, ['fhirId']) {
    @IsOptional()
    @ApiProperty({ description: 'OTP', example: "123456" })
    @Type(() => Number)
    @IsNumber()
    otp: number;
}