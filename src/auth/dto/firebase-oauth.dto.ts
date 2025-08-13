import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../Utils/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class FirebaseOAuthDto {
    @ApiProperty({
        description: 'Firebase token for authentication',
        example: 'firebase-token-123',
        required: false
    })
    @IsString()
    firebaseToken: string;

    @ApiProperty({
        description: 'Role of the user attempting to login',
        enum: Role,
        example: Role.PATIENT,
        required: true
    })
    @IsEnum(Role)
    role: Role;
} 