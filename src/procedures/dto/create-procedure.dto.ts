import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ProcedureStatus } from '../entities/procedure.entity';

export class CreateProcedureDto {
    @IsString()
    fhirId: string;

    @IsEnum(ProcedureStatus)
    @IsOptional()
    status?: ProcedureStatus;

    @IsString()
    @IsOptional()
    code?: string;

    @IsUUID()
    subjectId: string;

    @IsUUID()
    @IsOptional()
    encounterId?: string;

    @IsDateString()
    @IsOptional()
    occurrenceStart?: string;

    @IsDateString()
    @IsOptional()
    occurrenceEnd?: string;
} 