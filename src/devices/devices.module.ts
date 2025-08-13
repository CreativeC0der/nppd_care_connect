import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { Device } from './entities/device.entity';
import { DeviceUsage } from './entities/device-usage.entity';
import { Location } from 'src/locations/entities/location.entity';
import { Organization } from 'src/organizations/entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, DeviceUsage, Location, Organization])],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService]
})
export class DevicesModule { }
