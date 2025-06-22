import { Body, Controller, Get, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CareplanService } from './careplans.service';
import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { CreateCareplanDto } from './dto/create_cp.dto';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { UpdateCareplanDto } from './dto/update_cp.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';

@Controller('careplans')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class CareplansController {
  constructor(private readonly carePlansService: CareplanService) { }

  @Post('create')
  @ApiResponse({ status: 201, type: ApiResponseDTO })
  @Roles([Role.DOCTOR])
  async createCarePlan(@Body() carePlanData: CreateCareplanDto) {
    try {
      const payload = await this.carePlansService.createCarePlan(carePlanData);
      return new ApiResponseDTO({ message: 'Care plan created successfully', data: payload, statusCode: HttpStatus.OK })
    }
    catch (err) {
      if (err instanceof NotFoundException)
        throw err;
      throw new InternalServerErrorException('Care plan creation failed')
    }
  }

  @Get('get/:patientId')
  @Roles([Role.DOCTOR])
  @ApiResponse({ status: 200, type: ApiResponseDTO })
  @ApiParam({ name: 'patientId', description: 'care plans for patient id' })
  async getCarePlan(@Param('patientId') patientId: string) {
    const payload = await this.carePlansService.getByPatientFhirId(patientId);
    return new ApiResponseDTO({ message: 'Care plans fetched successfully', data: payload, statusCode: HttpStatus.OK });
  }

  @Put('update/:carePlanFhirId')
  @Roles([Role.DOCTOR])
  async updateCarePlan(@Param('carePlanFhirId') carePlanFhirId: string, @Body() carePlanData: UpdateCareplanDto) {
    const payload = await this.carePlansService.updateCarePlan(carePlanFhirId, carePlanData);
    return new ApiResponseDTO({ message: 'Care plan updated successfully', data: payload, statusCode: HttpStatus.OK });
  }

}
