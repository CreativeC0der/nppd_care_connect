import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsArray, ValidateNested, IsString } from 'class-validator';
import { QuestionnaireResponseStatus } from '../entities/questionnaireResponse.entity';
import { Type } from 'class-transformer';
import { QuestionnaireItemDto } from 'src/Utils/classes/questionnaire-item.dto';

export class CreateQuestionnaireResponseDto {
    @ApiProperty({
        description: 'FHIR ID of the QuestionnaireResponse',
        example: 'qr-001',
    })
    @IsNotEmpty()
    fhirId: string;

    @ApiProperty({
        description: 'Status of the response',
        enum: QuestionnaireResponseStatus,
        example: QuestionnaireResponseStatus.COMPLETED,
    })
    @IsEnum(QuestionnaireResponseStatus)
    status: QuestionnaireResponseStatus;

    @ApiProperty({
        description: 'Timestamp when the answers were gathered (ISO 8601)',
        example: '2024-06-04T15:30:00Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    authored?: Date;

    @ApiProperty({
        description: 'The response items structure based on the Questionnaire',
        type: 'array',
        additionalProperties: true,
        example: [{
            "linkId": "1",
            "text": "Do you have allergies?",
            "answer": [{ "valueBoolean": true }]
        },
        {
            "linkId": "2",
            "text": "General questions",
            "item": [{
                "linkId": "2.1",
                "text": "What is your gender?",
                "answer": [{ "valueString": "Male" }]
            },
            {
                "linkId": "2.2",
                "text": "What is your date of birth?",
                "answer": [{ "valueString": "1995-08-23" }]
            },]
        },
        ]
    })
    @ValidateNested({ each: true })
    @Type(() => QuestionnaireItemDto)
    items: QuestionnaireItemDto[];

    @ApiProperty({
        description: 'UUID of the associated Questionnaire',
        example: 'd87d7b25-f8c3-4b38-a03a-3f63d2420e3f',
    })
    @IsString()
    questionnaireFhirId: string;

    @ApiProperty({
        description: 'UUID of the encounter (optional)',
        example: 'e35f7033-6a76-4d67-97e0-45644e64838b',
        required: false,
    })
    @IsString()
    @IsOptional()
    encounterFhirId?: string;

    @ApiProperty({
        description: 'UUID of the patient who filled out the form',
        example: '7a3a75e9-1954-45dc-9b89-4debd20c19d5',
    })
    @IsString()
    subjectFhirId: string;

    @ApiProperty({
        description: 'UUID of the practitioner who authored the response (optional)',
        example: 'fc7f1d33-3a6e-46c7-9dd6-35b66f3ecf93',
        required: false,
    })
    @IsString()
    @IsOptional()
    authorFhirId?: string;
}
