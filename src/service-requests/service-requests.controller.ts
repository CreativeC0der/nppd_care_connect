import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Service Requests')
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(private readonly serviceRequestService: ServiceRequestsService) { }

  @Post('create')
  create(@Body() dto: CreateServiceRequestDto) {
    return this.serviceRequestService.createServiceRequests(dto);
  }
}
