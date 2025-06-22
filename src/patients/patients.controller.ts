import { BadRequestException, Body, Controller, HttpCode, HttpStatus, InternalServerErrorException, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { LoginPatientDto } from './dto/login_patient.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { Public } from 'src/Utils/decorators/public.decorator';
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

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiResponse({ type: ApiResponseDTO })
  async loginPatient(@Body() patientData: LoginPatientDto) {
    try {
      const { message, data } = await this.patientService.loginPatient(patientData);
      return new ApiResponseDTO({ message, statusCode: HttpStatus.OK, data });
    }
    catch (err) {
      console.error(err);
      if (err instanceof UnauthorizedException)
        throw err;
      throw new InternalServerErrorException('Login Failed! with error: ' + err.message);
    }
  }

  @Post('/register')
  @Roles([Role.PATIENT])
  @ApiResponse({ status: HttpStatus.CREATED, type: ApiResponseDTO })
  async createPatient(@Body() patientData: CreatePatientDto) {
    try {
      const payload = await this.patientService.createPatient(patientData);
      return new ApiResponseDTO({ message: 'Patient Registered Successfully', statusCode: HttpStatus.OK, data: payload });
    }
    catch (err) {
      console.error(err);
      if (err instanceof BadRequestException)
        throw err;

      throw new InternalServerErrorException('Registration Failed! with error: ' + err.message);
    }
  }

}
