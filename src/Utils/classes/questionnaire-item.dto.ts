import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class QuestionnaireItemAnswer {
    @IsOptional()
    @IsBoolean()
    valueBoolean?: boolean;

    @IsOptional()
    @IsNumber()
    valueDecimal?: number;

    @IsOptional()
    @IsNumber()
    valueInteger?: number;

    @IsOptional()
    @IsDateString()
    valueDate?: string;

    @IsOptional()
    @IsDateString()
    valueDateTime?: string;

    @IsOptional()
    @IsString()
    valueTime?: string;

    @IsOptional()
    @IsString()
    valueString?: string;

    @IsOptional()
    @IsString()
    valueUri?: string;

    @IsOptional()
    @IsObject()
    valueAttachment?: any;

    @IsOptional()
    @IsObject()
    valueQuantity?: any;

    @IsOptional()
    @IsObject()
    valueReference?: any;
}

export class QuestionnaireItemDto {
    @IsString()
    @IsNotEmpty()
    linkId: string;

    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    definition?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionnaireItemAnswer)
    answer?: QuestionnaireItemAnswer[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionnaireItemDto)
    item?: QuestionnaireItemDto[];
}
