import { BadRequestException, Body, Controller, HttpCode, HttpStatus, InternalServerErrorException, Post, Res, UnauthorizedException } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { Public } from 'src/Utils/decorators/public.decorator';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { CreatePractitionerDto } from './dto/create_practitioner.dto';
import { LoginPractitionerDto } from './dto/login_practitioner.dto';
import { Response } from 'express';

@Controller('practitioners')
export class PractitionersController {
  constructor(private readonly practitionersService: PractitionersService) { }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiResponse({ type: ApiResponseDTO })
  async loginPractitioner(@Body() PractitionerData: LoginPractitionerDto, @Res({ passthrough: true }) res: Response) {
    try {
      const { message, data, accessToken } = await this.practitionersService.loginPractitioner(PractitionerData);
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
}
