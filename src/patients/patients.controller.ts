import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, Param, Post, UseGuards, Query, Req, UnauthorizedException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { CreatePatientDto } from './dto/create_patient.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';

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
  @Roles([Role.ADMIN])
  async getAllPatients(@Param('organizationFhirId') organizationFhirId: string, @Req() request: any) {
    try {

      const payload = await this.patientService.getAllPatients(organizationFhirId);
      return new ApiResponseDTO({ message: 'Patients Retrieved Successfully', statusCode: HttpStatus.OK, data: payload });
    }
    catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Retrieval Failed ' + err.message);
    }
  }

  @Get('get-by-practitioner/:organizationFhirId')
  @ApiOkResponse({
    description: 'List of patients for the authenticated practitioner',
    type: ApiResponseDTO,
  })
  @ApiParam({ name: 'organizationFhirId', description: 'Organization FHIR ID' })
  @Roles([Role.DOCTOR])
  async getPatientsByPractitioner(
    @Param('organizationFhirId') organizationFhirId: string,
    @Req() req: any
  ) {
    try {
      const practitionerId = req.user.id;
      const payload = await this.patientService.getPatientsByPractitioner(organizationFhirId, practitionerId);
      return new ApiResponseDTO({
        message: 'Patients Retrieved Successfully',
        statusCode: HttpStatus.OK,
        data: payload
      });
    }
    catch (err) {
      console.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Retrieval Failed: ' + err.message);
    }
  }

}
