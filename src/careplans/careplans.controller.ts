import { Controller, UseGuards } from '@nestjs/common';
import { CareplanService } from './careplans.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';

@Controller('careplans')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class CareplansController {
  constructor(private readonly careplansService: CareplanService) {

  }

  // @Post('create')
  // @ApiResponse({ status: 201, type: ApiResponseDTO })
  // createCarePlan(@Body() carePlanData: CreateCarePlanDTO, @Req() req: Request) {
  //   const payload = this.carePlansService.createCarePlan(carePlanData, req);
  //   return new ApiResponseDTO({ message: 'Care plan created successfully', data: payload, status: 'success' })
  // }
}
