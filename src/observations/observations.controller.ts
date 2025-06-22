import { BadRequestException, Body, Controller, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ObservationsService } from './observations.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateCareplanDto } from 'src/careplans/dto/create_cp.dto';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { CreateObservationDto } from 'src/observations/dto/create_observation.dto';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { Request } from 'express';
import { UpdateObservationDto } from './dto/update_observation.dto';

@Controller('observations')
@Controller('careplans')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ObservationsController {
  constructor(private readonly observationsService: ObservationsService) { }

  @Post('create')
  @ApiResponse({ status: 201, type: ApiResponseDTO })
  @Roles([Role.PATIENT, Role.DOCTOR])
  async createObservation(@Body() observationDto: CreateObservationDto, @Req() request: any) {
    try {
      const payload = await this.observationsService.createObservation(observationDto, request);
      return new ApiResponseDTO({ message: 'Observation created successfully', data: payload, statusCode: HttpStatus.OK })
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
}
