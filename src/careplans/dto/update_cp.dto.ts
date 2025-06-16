import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { CreateCareplanDto } from "./create_cp.dto";
import { IsString } from "class-validator";

export class UpdateCareplanDto extends PartialType(OmitType(CreateCareplanDto, ['fhirId'])) { }