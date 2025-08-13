import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DeviceUtilizationResult } from './devices.service';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';

@Controller('devices')
@UseGuards(AuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) { }

  @Get('utilization')
  @Roles([Role.ADMIN, Role.DOCTOR])
  async getDeviceUtilization(
    @Query('deviceType') deviceType: string,
    @Query('organizationFhirId') organizationFhirId: string
  ): Promise<DeviceUtilizationResult> {
    return this.devicesService.getDeviceUtilization(deviceType, organizationFhirId);
  }
}
