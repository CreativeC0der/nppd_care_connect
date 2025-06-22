import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { CreateObservationDto } from "./create_observation.dto";
import { IsString } from "class-validator";

export class UpdateObservationDto extends PartialType(OmitType(CreateObservationDto, ['fhirId', 'patientFhirId'])) { }