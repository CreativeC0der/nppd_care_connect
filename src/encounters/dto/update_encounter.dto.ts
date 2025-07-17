import { PartialType } from '@nestjs/mapped-types';
import { CreateEncounterDto } from './create_encounter.dto';
import { OmitType } from '@nestjs/swagger';


export class UpdateEncounterDto extends PartialType(OmitType(CreateEncounterDto, ['fhirId'])) { }
