import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { GetSchedulesDto } from 'src/schedules/dto/get_schedules.dto';
import { CreateAppointmentDto } from './dto/create_appointment.dto';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthGuard } from '../Utils/guards/auth.guard';
import { RolesGuard } from '../Utils/guards/role.guard';
import { Roles } from '../Utils/decorators/roles.decorator';
import { Role } from '../Utils/enums/role.enum';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    role: string;
    firebaseUid: string;
    id?: string;
    [key: string]: any;
  };
}

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post('create')
  @Roles([Role.ADMIN, Role.DOCTOR])
  @ApiOperation({ summary: 'Create a new appointment' })
  async create(@Body() dto: CreateAppointmentDto,) {
    try {
      const payload = await this.appointmentsService.create(dto);
      return new ApiResponseDTO({ message: 'Appontment Registered Successfully', statusCode: HttpStatus.CREATED, data: payload });
    }
    catch (e) {
      console.log(e)
      if (e instanceof BadRequestException || e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Error creating appointment')
    }

  }

  @Get()
  @Roles([Role.ADMIN, Role.DOCTOR])
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'List of all appointments', type: ApiResponseDTO })
  @ApiQuery({ name: 'organizationFhirId', description: 'FHIR ID of the organization' })
  async findAll(@Query('organizationFhirId') organizationFhirId: string, @Req() req: AuthenticatedRequest) {
    try {
      const practitionerId = req.user.role === Role.DOCTOR ? req.user.id : undefined;
      const data = await this.appointmentsService.findAll(organizationFhirId, practitionerId);
      return new ApiResponseDTO({ statusCode: HttpStatus.OK, data, message: 'List of all appointments', length: data.length });
    } catch (error) {
      return new ApiResponseDTO({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, data: null, message: 'Error fetching appointments' });
    }
  }

  @Get('get')
  @Roles([Role.ADMIN, Role.DOCTOR])
  @ApiQuery({ name: 'patientFhirId', type: String, required: true, description: 'Get all appointments by patient FHIR ID', example: 'patient-001' })
  async getByPatientFhirId(@Query('patientFhirId') fhirId: string) {
    return this.appointmentsService.getAppointmentsByPatientFhirId(fhirId);
  }

  @Get('rates/:organizationFhirId')
  @Roles([Role.ADMIN, Role.DOCTOR])
  @ApiOperation({ summary: 'Get appointment no-show and cancellation rates by month for an organization' })
  @ApiParam({ name: 'organizationFhirId', description: 'Organization FHIR ID', example: 'org-001' })
  @ApiResponse({
    status: 200,
    description: 'Appointment rates retrieved successfully',
    type: ApiResponseDTO
  })
  async getAppointmentRatesByMonth(@Param('organizationFhirId') organizationFhirId: string, @Req() req: AuthenticatedRequest) {
    try {
      const practitionerId = req.user.role === Role.DOCTOR ? req.user.id : undefined;
      const payload = await this.appointmentsService.getAppointmentRatesByMonth(organizationFhirId, practitionerId);
      return new ApiResponseDTO({
        message: 'Appointment rates retrieved successfully',
        statusCode: HttpStatus.OK,
        data: payload
      });
    } catch (e) {
      console.log(e);
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Error retrieving appointment rates');
    }
  }

}
