import { Body, Controller, InternalServerErrorException, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { ObservationsService } from './observations.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateCareplanDto } from 'src/careplans/dto/create_cp.dto';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { CreateObservationDto } from 'src/conditions/dto/create_observation.dto';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';

@Controller('observations')
@Controller('careplans')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ObservationsController {
  constructor(private readonly observationsService: ObservationsService) { }

  @Post('create')
  @ApiResponse({ status: 201, type: ApiResponseDTO })
  @Roles([Role.PATIENT, Role.DOCTOR])
  async createObservation(@Body() observationDto: CreateObservationDto) {
    try {
      const payload = await this.observationsService.createObservation(observationDto);
      return new ApiResponseDTO({ message: 'Observation created successfully', data: payload, status: 'success' })
    }
    catch (err) {
      if (err instanceof NotFoundException)
        throw err;
      throw new InternalServerErrorException('Observation creation failed')
    }
  }
}
