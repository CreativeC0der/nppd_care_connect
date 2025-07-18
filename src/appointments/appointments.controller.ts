import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { GetSchedulesDto } from 'src/schedules/dto/get_schedules.dto';
import { CreateAppointmentDto } from './dto/create_appointment.dto';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post('create')
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

  @Get('get')
  @ApiQuery({ name: 'patientFhirId', type: String, required: true, description: 'Get all appointments by patient FHIR ID', example: 'patient-001' })
  async getByPatientFhirId(@Query('patientFhirId') fhirId: string) {
    return this.appointmentsService.getAppointmentsByPatientFhirId(fhirId);
  }

}
