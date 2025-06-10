import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { CreatePatientDto } from './create_patient.dto';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class LoginPatientDto extends PickType(CreatePatientDto, ['fhirId']) {
    @IsNumber()
    @IsOptional()
    @ApiProperty({ description: 'OTP', example: 123456 })
    otp: number;
}