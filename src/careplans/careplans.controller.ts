import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CareplanService } from './careplans.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { CreateCareplanDto } from './dto/create_cp.dto';

@Controller('careplans')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class CareplansController {
  constructor(private readonly carePlansService: CareplanService) {

  }

  @Post('create')
  @ApiResponse({ status: 201, type: ApiResponseDTO })
  createCarePlan(@Body() carePlanData: CreateCareplanDto, @Req() req: Request) {
    const payload = this.carePlansService.createCarePlan(carePlanData, req);
    return new ApiResponseDTO({ message: 'Care plan created successfully', data: payload, status: 'success' })
  }

  @Get('get/:id')
  @ApiResponse({ status: 200, type: ApiResponseDTO })
  getCarePlan(@Param('id') id: string, @Req() req: Request) {
    const payload = this.carePlansService.getCarePlan(id, req);
    return new ApiResponseDTO({message: 'Care plan fetched successfully', data: payload, status: 'success'});
    }
}
