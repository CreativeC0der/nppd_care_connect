import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Put, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ObservationsService } from './observations.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { CreateObservationDto } from 'src/observations/dto/create_observation.dto';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { UpdateObservationDto } from './dto/update_observation.dto';
import { Observation } from './entities/observation.entity';
import { EncountersService } from 'src/encounters/encounters.service';

@Controller('observations')
@Controller('careplans')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ObservationsController {
  constructor(private readonly observationsService: ObservationsService
    , private readonly encountersService: EncountersService
  ) { }

  @Post('create')
  @ApiResponse({ status: 201, type: ApiResponseDTO })
  @Roles([Role.PATIENT, Role.DOCTOR])
  async createObservation(@Body() observationDto: CreateObservationDto, @Req() request: any) {
    try {
      const payload = await this.observationsService.createObservations(observationDto, request);
      return new ApiResponseDTO({ message: 'Observations created successfully', data: payload, statusCode: HttpStatus.CREATED })
    }
    catch (err) {
      console.error(err);
      if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof UnauthorizedException)
        throw err;

      throw new InternalServerErrorException('Observation creation failed')
    }
  }

  @Put('update/:fhirId')
  @ApiParam({ name: 'fhirId', description: 'UUID of the observation' })
  @ApiResponse({ status: 200, description: 'Observation updated successfully', type: ApiResponseDTO })
  @Roles([Role.PATIENT, Role.DOCTOR])
  async update(@Param('fhirId') fhirId: string, @Body() updateDto: UpdateObservationDto, @Req() request: any) {
    try {
      const payload = await this.observationsService.updateObservation(fhirId, updateDto, request);
      return new ApiResponseDTO({ message: 'Observation updated successfully', data: payload, statusCode: HttpStatus.OK });
    } catch (err) {
      console.error(err)
      if (err instanceof NotFoundException || err instanceof UnauthorizedException || err instanceof BadRequestException)
        throw err;
      throw new InternalServerErrorException('Observation update failed')
    }

  }

  @Get('get-by-encounter/:encounterFhirId')
  @ApiOperation({ summary: 'Get all observations by encounter FHIR ID' })
  @ApiOkResponse({ type: [Observation] })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getByEncounter(
    @Param('encounterFhirId') encounterFhirId: string,
  ): Promise<ApiResponseDTO> {
    try {
      const data = await this.observationsService.getByEncounterFhirId(encounterFhirId);
      return new ApiResponseDTO({
        message: 'Observations fetched successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Get('critical-by-practitioner')
  @ApiOperation({ summary: 'Get critical observations for all patients of a practitioner' })
  @ApiQuery({ name: 'organizationFhirId', description: 'FHIR ID of the organization', required: true })
  @ApiOkResponse({ type: [Observation] })
  @Roles([Role.DOCTOR])
  async getCriticalObservationsByPractitioner(
    @Query('organizationFhirId') organizationFhirId: string,
    @Req() req: any
  ): Promise<ApiResponseDTO> {
    try {
      const data = await this.observationsService.getCriticalObservationsByPractitioner(
        organizationFhirId,
        req.user.id
      );
      return new ApiResponseDTO({
        message: 'Critical observations fetched successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Get('trends-by-patient')
  @ApiOperation({ summary: 'Get observation trends by patient' })
  @ApiQuery({ name: 'patientFhirId', description: 'FHIR ID of the patient', required: true })
  @ApiQuery({ name: 'organizationFhirId', description: 'FHIR ID of the organization', required: true })
  @ApiOkResponse({ type: [Observation] })
  @Roles([Role.DOCTOR])
  async getObservationTrendsByPatient(
    @Query('patientFhirId') patientFhirId: string,
    @Query('organizationFhirId') organizationFhirId: string,
    @Req() req: any
  ): Promise<ApiResponseDTO> {
    try {
      const isLink = await this.encountersService.checkPatientPractitionerLink(req.user.id, patientFhirId, organizationFhirId);
      if (!isLink)
        throw new UnauthorizedException('You are not authorized to fetch observations for this patient');

      const data = await this.observationsService.getObservationTrendsByPatient(
        patientFhirId,
        organizationFhirId,
      );
      return new ApiResponseDTO({
        message: 'Observation trends fetched successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}
