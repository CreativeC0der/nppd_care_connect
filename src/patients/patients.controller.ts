import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { LoginPatientDto } from './dto/login_patient.dto';
import { ApiBearerAuth, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { Public } from 'src/Utils/decorators/public.decorator';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { CreatePatientDto } from './dto/create_patient.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Response } from 'express';
import { Patient } from './entities/patient.entity';

@Controller('patients')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PatientsController {

  constructor(private readonly patientService: PatientsService) { }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiResponse({ type: ApiResponseDTO })
  async loginPatient(@Body() patientData: LoginPatientDto, @Res({ passthrough: true }) res: Response) {
    try {
      const { message, data, accessToken } = await this.patientService.loginPatient(patientData);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false, // use false in dev (http), true in prod (https)
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 15 mins
      })
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
  @Roles([Role.DOCTOR, Role.STAFF])
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

  @Get('all')
  @ApiOkResponse({
    description: 'List of all patients',
    type: ApiResponseDTO,
  })
  @Roles([Role.DOCTOR, Role.STAFF])
  async getAllPatients() {
    try {
      const payload = await this.patientService.getAllPatients();
      return new ApiResponseDTO({ message: 'Patients Retrieved Successfully', statusCode: HttpStatus.OK, data: payload });
    }
    catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Retrieval Failed ' + err.message);
    }
  }

}
