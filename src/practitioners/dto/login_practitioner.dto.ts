import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { CreatePractitionerDto } from './create_practitioner.dto';

export class LoginPractitionerDto extends PickType(CreatePractitionerDto, ['fhirId']) {
    @IsNumber()
    @IsOptional()
    @ApiProperty({ description: 'OTP', example: 123456 })
    otp: number;
}