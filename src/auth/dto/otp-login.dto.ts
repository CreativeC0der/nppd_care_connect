import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from 'src/Utils/enums/role.enum';

export class OtpLoginDto {
    @ApiProperty({
        description: 'FHIR ID of the user (patient or practitioner)',
        example: 'patient-123'
    })
    @IsString()
    fhirId: string;

    @ApiProperty({
        description: 'One-time password for authentication',
        example: 123456,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    otp?: number;

    @ApiProperty({
        description: 'Role of the user attempting to login',
        enum: Role,
        example: Role.PATIENT,
        required: true
    })
    @IsEnum(Role)
    role: Role;
} 