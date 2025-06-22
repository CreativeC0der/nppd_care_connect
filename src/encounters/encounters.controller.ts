import { BadRequestException, Body, ConflictException, Controller, ForbiddenException, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { EncountersService } from './encounters.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateEncounterDto } from './dto/create_encounter.dto';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Role } from 'src/Utils/enums/role.enum';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { CancelEncounterDto } from './dto/cancel_encounter.dto';

@Controller('encounters')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class EncountersController {
  constructor(private readonly encountersService: EncountersService) { }

  @Post('create')
  @Roles([Role.PATIENT])
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

  @Put('cancel/:fhirId')
  @Roles([Role.PATIENT, Role.DOCTOR])
  @ApiOperation({ summary: 'Cancel an encounter by FHIR ID' })
  @ApiParam({ name: 'fhirId', required: true, description: 'FHIR ID of the encounter' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Encounter updated', type: ApiResponseDTO })
  async updateEncounter(@Param('fhirId') fhirId: string, @Body() dto: CancelEncounterDto, @Req() req: any,) {
    try {
      const user = req.user;
      const payload = await this.encountersService.cancelEncounterByFhirId(fhirId, dto, user);
      return new ApiResponseDTO({ message: 'Encounter scheduled successfully', data: payload, statusCode: HttpStatus.OK });
    }
    catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException || err instanceof ForbiddenException)
        throw err

      console.log(err)
      throw new InternalServerErrorException('An unexpected error occurred');
    }

  }

}
