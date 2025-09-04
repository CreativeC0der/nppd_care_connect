import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { ApiResponse, ApiOperation, ApiParam, ApiOkResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { CreatePractitionerDto } from './dto/create_practitioner.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';

@Controller('practitioners')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PractitionersController {
  constructor(private readonly practitionersService: PractitionersService) { }

  @Post('/register')
  @Roles([Role.DOCTOR])
  @ApiResponse({ status: HttpStatus.CREATED, type: ApiResponseDTO })
  async createPractitioner(@Body() PractitionerData: CreatePractitionerDto) {
    try {
      const payload = await this.practitionersService.createPractitioner(PractitionerData);
      return new ApiResponseDTO({ message: 'Practitioner Registered Successfully', statusCode: HttpStatus.OK, data: payload });
    }
    catch (err) {
      console.error(err);
      if (err instanceof BadRequestException)
        throw err;

      throw new InternalServerErrorException('Registration Failed! with error: ' + err.message);
    }
  }

  @Get('with-encounter-counts')
  @ApiQuery({ name: 'organizationFhirId', type: String })
  @ApiQuery({ name: 'practitionerFhirId', type: String, required: false })
  @ApiOperation({ summary: 'Get all practitioners of an organization with their encounter counts' })
  @ApiOkResponse({ type: ApiResponseDTO })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getPractitionersWithEncounterCounts(
    @Query('organizationFhirId') organizationFhirId: string,
    @Query('practitionerFhirId') practitionerFhirId?: string): Promise<ApiResponseDTO> {
    try {
      const data = await this.practitionersService.getPractitionersWithEncounterCounts(organizationFhirId, practitionerFhirId);
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
}
