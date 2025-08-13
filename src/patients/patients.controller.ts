import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, Param, Post, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { CreatePatientDto } from './dto/create_patient.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Patient } from './entities/patient.entity';

@Controller('patients')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PatientsController {

  constructor(private readonly patientService: PatientsService) { }

  @Post('/register')
  @Roles([Role.DOCTOR, Role.ADMIN])
  @ApiResponse({ status: HttpStatus.CREATED, type: ApiResponseDTO })
  async createPatient(@Body() patientData: CreatePatientDto) {
    try {
      const payload = await this.patientService.createPatient(patientData);
      return new ApiResponseDTO({ message: 'Patient Registered Successfully', statusCode: HttpStatus.CREATED, data: payload });
    }
    catch (err) {
      console.error(err);
      if (err instanceof BadRequestException)
        throw err;

      throw new InternalServerErrorException('Registration Failed! with error: ' + err.message);
    }
  }

  @Get('all/:organizationFhirId')
  @ApiOkResponse({
    description: 'List of all patients',
    type: ApiResponseDTO,
  })
  @ApiParam({ name: 'organizationFhirId', description: 'Organization FHIR ID' })
  @Roles([Role.DOCTOR, Role.ADMIN])
  async getAllPatients(@Param('organizationFhirId') organizationFhirId: string) {
    try {
      const payload = await this.patientService.getAllPatients(organizationFhirId);
      return new ApiResponseDTO({ message: 'Patients Retrieved Successfully', statusCode: HttpStatus.OK, data: payload });
    }
    catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Retrieval Failed ' + err.message);
    }
  }

}
