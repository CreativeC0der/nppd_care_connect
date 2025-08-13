import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { ApiCreatedResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { CreateScheduleDto } from './dto/create_schedule.dto';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Role } from 'src/Utils/enums/role.enum';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { GetSchedulesDto, GetSchedulesByPractitionerDto } from 'src/schedules/dto/get_schedules.dto';

@Controller('schedules')
@UseGuards(AuthGuard, RolesGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) { }

  @Get('get')
  @ApiOperation({ summary: 'Get schedules filtered by start, end and specialty' })
  @ApiQuery({ name: 'specialty', type: String, required: true, description: 'Specialty of the schedule', example: 'Cardiology' })
  @ApiQuery({ name: 'end', type: Date, required: true, description: 'End date of the planning horizon', example: '2025-06-10T17:00:00Z', })
  @ApiQuery({ name: 'start', type: Date, required: true, description: 'Start date of the planning horizon', example: '2025-06-10T15:00:00Z', })
  @Roles([Role.ADMIN, Role.DOCTOR])
  async getSchedules(@Query() query: GetSchedulesDto) {
    return this.schedulesService.getFilteredSchedules(query.start, query.end, query.specialty);
  }

  @Get('get-by-practitioner')
  @ApiOperation({ summary: 'Get all schedules with slots for a particular practitioner' })
  @ApiQuery({ name: 'practitionerFhirId', type: String, required: true, description: 'Practitioner FHIR ID', example: 'practitioner-123' })
  @Roles([Role.ADMIN, Role.DOCTOR])
  async getSchedulesByPractitioner(@Query() query: GetSchedulesByPractitionerDto) {
    return this.schedulesService.getSchedulesByPractitioner(query.practitionerFhirId);
  }

  @Post('create')
  @ApiOperation({ description: 'Create a new schedule' })
  @ApiCreatedResponse({ type: ApiResponseDTO })
  @Roles([Role.ADMIN, Role.DOCTOR])
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.createSchedule(dto);
  }

}
