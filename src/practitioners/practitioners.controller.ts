import { BadRequestException, Body, Controller, HttpCode, HttpStatus, InternalServerErrorException, Post, UnauthorizedException } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { Public } from 'src/Utils/decorators/public.decorator';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { CreatePractitionerDto } from './dto/create_practitioner.dto';

@Controller('practitioners')
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
}
