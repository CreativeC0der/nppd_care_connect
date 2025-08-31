import { Controller, Post, Body, UseGuards, BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException, Req, UnauthorizedException, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Condition } from './entities/condition.entity';
import { CreateConditionDto } from './dto/create-conditions.dto';
import { ConditionsService } from './conditions.service';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Role } from 'src/Utils/enums/role.enum';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthenticatedRequest } from 'src/Utils/classes/request.interface';

@ApiTags('Conditions')
@Controller('conditions')
@UseGuards(AuthGuard, RolesGuard)
export class ConditionsController {
  constructor(private readonly conditionService: ConditionsService) { }

  @Post('create')
  @ApiOperation({ summary: 'Bulk create conditions' })
  @ApiResponse({ status: 201, type: ApiResponseDTO })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async bulkCreate(@Body() dto: CreateConditionDto): Promise<ApiResponseDTO> {
    try {
      const data = await this.conditionService.bulkCreate(dto);
      return new ApiResponseDTO({
        message: 'Conditions created successfully', data, statusCode: HttpStatus.CREATED,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Condition creation failed');
    }
  }

  @Get('counts-last-two-months')
  @ApiOperation({ summary: 'Get condition counts for the last 2 months' })
  @ApiResponse({ status: 200, description: 'Condition counts retrieved successfully' })
  @ApiQuery({ name: 'organizationFhirId', required: true, description: 'The FHIR ID of the organization' })
  @Roles([Role.DOCTOR])
  async getConditionCountsLastTwoMonths(
    @Query('organizationFhirId') organizationFhirId: string,
    @Req() req: AuthenticatedRequest): Promise<ApiResponseDTO> {
    try {
      const practitionerId = req.user.role === Role.DOCTOR ? req.user.id : undefined;
      const data = await this.conditionService.getConditionCountsLastTwoMonths(organizationFhirId, practitionerId);
      return new ApiResponseDTO({
        message: 'Condition counts retrieved successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to retrieve condition counts');
    }
  }
}
