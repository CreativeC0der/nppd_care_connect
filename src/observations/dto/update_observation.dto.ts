import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { CreateObservationDto } from "./create_observation.dto";
import { IsString } from "class-validator";
import { ObservationDto } from "./observation.dto";

export class UpdateObservationDto extends PartialType(OmitType(ObservationDto, ['fhirId'])) { }