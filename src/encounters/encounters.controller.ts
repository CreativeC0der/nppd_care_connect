import { BadRequestException, Body, ConflictException, Controller, Get, HttpStatus, InternalServerErrorException, NotFoundException, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EncountersService } from './encounters.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { CreateEncounterDto } from './dto/create_encounter.dto';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Role } from 'src/Utils/enums/role.enum';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { UpdateEncounterDto } from './dto/update_encounter.dto';

@Controller('encounters')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class EncountersController {
  constructor(private readonly encountersService: EncountersService) { }

  @Post('create')
  @Roles([Role.DOCTOR, Role.ADMIN])
  @ApiOperation({ summary: 'Create a new encounter if all practitioners are available' })
  @ApiResponse({ status: 201, description: 'Encounter scheduled successfully', type: ApiResponseDTO })
  async create(@Body() createEncounterDto: CreateEncounterDto, @Req() request: any) {
    try {
      const result = await this.encountersService.createEncounter(createEncounterDto, request);
      return new ApiResponseDTO({ message: 'Encounter scheduled successfully', data: result, statusCode: HttpStatus.OK });
    }
    catch (error) {
      // Forward known exceptions
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException)
        throw error;

      // Catch unexpected errors
      console.error('Unexpected error while creating encounter:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('get-by-patient')
  @ApiOperation({ summary: 'Get all encounters by patient FHIR ID' })
  @ApiOkResponse({ type: ApiResponseDTO })
  @ApiQuery({ name: 'patientFhirId', type: String })
  @ApiQuery({ name: 'organizationFhirId', type: String })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getByPatientFhirId(
    @Query('patientFhirId') patientFhirId: string,
    @Query('organizationFhirId') organizationFhirId: string,
    @Req() request: any,
  ): Promise<ApiResponseDTO> {
    const practitionerId = request.user.role === Role.DOCTOR ? request.user.id : undefined;

    // Get only encounters for the practitioner if the user is a doctor
    const data = await this.encountersService.getByPatientFhirId(patientFhirId, organizationFhirId, practitionerId);
    return new ApiResponseDTO({
      message: 'Encounters fetched successfully',
      data,
      statusCode: HttpStatus.OK,
    });
  }

  @Get('get-by-organization/:organizationFhirId')
  @ApiOperation({ summary: 'Get all encounters by organization FHIR ID' })
  @ApiOkResponse({ type: ApiResponseDTO })
  @ApiParam({ name: 'organizationFhirId', type: String })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getByOrganizationFhirId(
    @Param('organizationFhirId') organizationFhirId: string,
    @Req() request: any,
  ): Promise<ApiResponseDTO> {
    try {
      const practitionerId = request.user.role === Role.DOCTOR ? request.user.id : undefined;
      const data = await this.encountersService.getEncountersByOrganization(organizationFhirId, practitionerId);
      return new ApiResponseDTO({
        message: 'Encounters fetched successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch encounters by organization');
    }
  }

  @Get('grouped-by-class/:organizationFhirId')
  @ApiParam({ name: 'organizationFhirId', type: String })
  @ApiOperation({ summary: 'Get encounters grouped by class with counts' })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getEncountersGroupedByClass(@Param('organizationFhirId') organizationFhirId: string)
    : Promise<ApiResponseDTO> {
    try {
      const data = await this.encountersService.getEncountersGroupedByClass(organizationFhirId);
      return new ApiResponseDTO({
        message: 'Encounters grouped by class fetched successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      console.error('Error fetching encounters grouped by class:', error);
      throw new InternalServerErrorException('Failed to fetch encounters grouped by class');
    }
  }

  @Get('grouped-by-type/:organizationFhirId')
  @ApiParam({ name: 'organizationFhirId', type: String })
  @ApiOperation({ summary: 'Get encounters grouped by type with counts' })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getEncountersGroupedByType(@Param('organizationFhirId') organizationFhirId: string)
    : Promise<ApiResponseDTO> {
    try {
      const data = await this.encountersService.getEncountersGroupedByType(organizationFhirId);
      return new ApiResponseDTO({
        message: 'Encounters grouped by type fetched successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      console.error('Error fetching encounters grouped by type:', error);
      throw new InternalServerErrorException('Failed to fetch encounters grouped by type');
    }
  }

  @Get('grouped-by-practitioner/:organizationFhirId')
  @ApiParam({ name: 'organizationFhirId', type: String })
  @ApiOperation({ summary: 'Get all practitioners of an organization with their encounter counts' })
  @ApiOkResponse({ type: ApiResponseDTO })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getPractitionersWithEncounterCounts(@Param('organizationFhirId') organizationFhirId: string)
    : Promise<ApiResponseDTO> {
    try {
      const data = await this.encountersService.getPractitionersWithEncounterCounts(organizationFhirId);
      return new ApiResponseDTO({
        message: 'Practitioners with encounter counts fetched successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching practitioners with encounter counts:', error);
      throw new InternalServerErrorException('Failed to fetch practitioners with encounter counts');
    }
  }

  @Get('average-length-of-stay/:organizationFhirId')
  @ApiParam({ name: 'organizationFhirId', type: String })
  @ApiOperation({ summary: 'Get average length of stay for discharged inpatient encounters in an organization' })
  @ApiOkResponse({ type: ApiResponseDTO })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getAverageLengthOfStay(@Param('organizationFhirId') organizationFhirId: string): Promise<ApiResponseDTO> {
    try {
      const data = await this.encountersService.getAverageLengthOfStay(organizationFhirId);
      return new ApiResponseDTO({
        message: 'Average length of stay calculated successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error calculating average length of stay:', error);
      throw new InternalServerErrorException('Failed to calculate average length of stay');
    }
  }

  @Get('yearwise-class-counts/:organizationFhirId')
  @ApiParam({ name: 'organizationFhirId', type: String })
  @ApiOperation({ summary: 'Get yearwise encounter class counts for an organization' })
  @ApiOkResponse({ type: ApiResponseDTO })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getYearwiseEncounterClassCounts(@Param('organizationFhirId') organizationFhirId: string): Promise<ApiResponseDTO> {
    try {
      const data = await this.encountersService.getYearwiseEncounterClassCounts(organizationFhirId);
      return new ApiResponseDTO({
        message: 'Yearwise encounter class counts fetched successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching yearwise encounter class counts:', error);
      throw new InternalServerErrorException('Failed to fetch yearwise encounter class counts');
    }
  }

  @Get('service-provider-load/:organizationFhirId')
  @ApiParam({ name: 'organizationFhirId', type: String })
  @ApiOperation({ summary: 'Get encounter counts grouped by service provider with load percentage calculation' })
  @ApiOkResponse({ type: ApiResponseDTO })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getServiceProviderLoadPercentage(@Param('organizationFhirId') organizationFhirId: string): Promise<ApiResponseDTO> {
    try {
      const data = await this.encountersService.getServiceProviderLoadPercentage(organizationFhirId);
      return new ApiResponseDTO({
        message: 'Service provider load percentage calculated successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error calculating service provider load percentage:', error);
      throw new InternalServerErrorException('Failed to calculate service provider load percentage');
    }
  }

  @Get('average-wait-time/:organizationFhirId')
  @ApiParam({ name: 'organizationFhirId', type: String })
  @ApiOperation({ summary: 'Get average wait time grouped by service provider for an organization' })
  @ApiOkResponse({ type: ApiResponseDTO })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getAverageWaitTimeGroupedByServiceProvider(@Param('organizationFhirId') organizationFhirId: string): Promise<ApiResponseDTO> {
    try {
      const data = await this.encountersService.getAverageWaitTimeGroupedByServiceProvider(organizationFhirId);
      return new ApiResponseDTO({
        message: 'Average wait times calculated successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error calculating average wait times:', error);
      throw new InternalServerErrorException('Failed to calculate average wait times');
    }
  }

  @Patch('update/:fhirId')
  @ApiOperation({ summary: 'Update encounter by FHIR ID' })
  @ApiParam({ name: 'fhirId', type: String })
  @ApiOkResponse({ type: ApiResponseDTO })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async update(@Param('fhirId') fhirId: string, @Body() dto: UpdateEncounterDto,) {
    try {
      const updated = await this.encountersService.updateByFhirId(fhirId, dto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Encounter updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw error

      throw new InternalServerErrorException('Failed to update encounter');

    }
  }



}
