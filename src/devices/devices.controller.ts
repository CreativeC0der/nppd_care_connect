import { Controller, Get, HttpStatus, InternalServerErrorException, Query, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DeviceUtilizationResult } from './devices.service';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';

@Controller('devices')
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('Devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) { }

  @Get('utilization')
  @Roles([Role.ADMIN, Role.DOCTOR])
  @ApiOperation({ summary: 'Get device utilization statistics' })
  @ApiQuery({ name: 'deviceType', description: 'Type of device to analyze' })
  @ApiQuery({ name: 'organizationFhirId', description: 'FHIR ID of the organization' })
  @ApiResponse({ status: 200, description: 'Device utilization data retrieved successfully', type: DeviceUtilizationResult })
  async getDeviceUtilization(
    @Query('deviceType') deviceType: string,
    @Query('organizationFhirId') organizationFhirId: string
  ): Promise<DeviceUtilizationResult> {
    return this.devicesService.getDeviceUtilization(deviceType, organizationFhirId);
  }

  @Get('all-with-usage-location')
  @Roles([Role.ADMIN, Role.DOCTOR])
  @ApiOperation({ summary: 'Get all devices with usage status and location' })
  @ApiResponse({ status: 200, description: 'Devices retrieved successfully', type: ApiResponseDTO })
  @ApiQuery({ name: 'organizationFhirId', description: 'FHIR ID of the organization' })
  async getAllDevicesWithUsageAndLocation(
    @Query() query: any
  ): Promise<ApiResponseDTO> {
    try {
      const payload = await this.devicesService.getAllDevicesWithUsageAndLocation(query.organizationFhirId);
      return new ApiResponseDTO({
        message: 'Devices retrieved successfully',
        statusCode: HttpStatus.OK,
        length: payload.length,
        data: payload
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error retrieving devices');
    }

  }
}
