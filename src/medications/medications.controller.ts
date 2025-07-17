import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, NotFoundException, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { Medication } from './entities/medication.entity';
import { CreateMedicationRequestDto } from './dto/create-medication-request.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';

@ApiTags('Medications')
@Controller('medications')
@UseGuards(AuthGuard, RolesGuard)
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create a medication' })
  @ApiCreatedResponse({ type: Medication })
  @Roles([Role.DOCTOR, Role.STAFF])
  async createMedication(@Body() dto: CreateMedicationDto): Promise<ApiResponseDTO> {
    try {
      const data = await this.medicationsService.create(dto);
      return new ApiResponseDTO({
        message: 'Medication created successfully',
        data,
        statusCode: HttpStatus.CREATED,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Medication creation failed');
    }
  }

  @Get('get-all')
  @ApiOperation({ summary: 'Get all medications' })
  @ApiOkResponse({ type: [Medication] })
  @Roles([Role.DOCTOR, Role.STAFF])
  async getAllMedications(): Promise<ApiResponseDTO> {
    try {
      const data = await this.medicationsService.findAll();
      return new ApiResponseDTO({
        message: 'Medications fetched successfully',
        data,
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch medications');
    }
  }

  @Post('create-request')
  @ApiOperation({ summary: 'Create bulk medication requests' })
  @ApiCreatedResponse({ type: ApiResponseDTO })
  @Roles([Role.DOCTOR, Role.STAFF])
  async createMedicationRequest(
    @Body() dto: CreateMedicationRequestDto,
  ): Promise<ApiResponseDTO> {
    try {
      const data = await this.medicationsService.createBulk(dto);
      return new ApiResponseDTO({
        message: 'Medication requests created successfully',
        data,
        statusCode: HttpStatus.CREATED,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Request creation failed');
    }
  }

}
