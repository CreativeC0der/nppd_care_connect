import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { QuestionnaireStatus } from '../entities/questionnaire.entity';
import { Type } from 'class-transformer';
import { QuestionnaireItemDto } from 'src/Utils/classes/questionnaire-item.dto';

export class CreateQuestionnaireDto {
    @ApiProperty({
        description: 'FHIR ID for the questionnaire',
        example: 'f201',
    })
    @IsString()
    @IsNotEmpty()
    fhirId: string;

    @ApiProperty({
        description: 'The status of the questionnaire',
        enum: QuestionnaireStatus,
        example: QuestionnaireStatus.ACTIVE,
    })
    @IsEnum(QuestionnaireStatus)
    status: QuestionnaireStatus;

    @ApiProperty({
        description: 'Subject types for which this questionnaire applies',
        example: ['Patient'],
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    subjectType?: string[];

    @ApiProperty({
        description: 'The item structure representing questionnaire questions',
        example: [
            {
                linkId: '1',
                text: 'Do you have allergies?',
                type: 'boolean',
            },
            {
                linkId: '2',
                text: 'General questions',
                type: 'group',
                item: [
                    {
                        linkId: '2.1',
                        text: 'What is your gender?',
                        type: 'string',
                    },
                    {
                        linkId: '2.2',
                        text: 'What is your date of birth?',
                        type: 'date',
                    },
                ],
            },
        ],
        type: 'array'
    })
    @ValidateNested({ each: true })
    @Type(() => QuestionnaireItemDto)
    items: QuestionnaireItemDto[];
}
