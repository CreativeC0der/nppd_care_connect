import { Controller, Get, Post, Body, Query, Param, UseGuards, BadRequestException, NotFoundException, HttpStatus } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationUtilizationDto } from './dto/location-utilization.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiParam, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '../Utils/guards/auth.guard';
import { RolesGuard } from '../Utils/guards/role.guard';
import { Roles } from '../Utils/decorators/roles.decorator';
import { Role } from '../Utils/enums/role.enum';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';

@ApiTags('locations')
@Controller('locations')
@UseGuards(AuthGuard, RolesGuard)
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new location' })
    @ApiCreatedResponse({ type: ApiResponseDTO })
    @Roles([Role.ADMIN])
    async createLocation(@Body() createLocationDto: CreateLocationDto) {
        const data = await this.locationsService.createLocation(createLocationDto);
        return new ApiResponseDTO({
            message: 'Location created successfully',
            data,
            statusCode: HttpStatus.CREATED,
        });
    }

    @Get('utilization')
    @ApiOperation({ summary: 'Get location utilization statistics' })
    @ApiOkResponse({ type: ApiResponseDTO })
    @Roles([Role.ADMIN, Role.DOCTOR])
    async getLocationUtilization(@Query() query: LocationUtilizationDto) {
        const data = await this.locationsService.getLocationUtilization(query);
        return new ApiResponseDTO({
            message: 'Location utilization data retrieved successfully',
            data,
            statusCode: HttpStatus.OK,
        });
    }

    @Get('root')
    @ApiOperation({ summary: 'Get root locations (partOf = null) with their sublocations' })
    @ApiOkResponse({ type: ApiResponseDTO })
    @ApiQuery({ name: 'organizationFhirId', description: 'Organization FHIR ID', required: true })
    @Roles([Role.ADMIN, Role.DOCTOR])
    async getRootLocationsWithSubLocations(@Query('organizationFhirId') organizationFhirId: string) {
        const data = await this.locationsService.getRootLocationsWithSubLocations(organizationFhirId);
        return new ApiResponseDTO({
            message: 'Root locations with sublocations retrieved successfully',
            data,
            length: data.length,
            statusCode: HttpStatus.OK,
        });
    }

    @Get()
    @ApiOperation({ summary: 'Get all locations' })
    @ApiOkResponse({ type: ApiResponseDTO })
    @ApiQuery({ name: 'organizationFhirId', description: 'Organization FHIR ID to filter locations by managing organization', required: true })
    @Roles([Role.ADMIN, Role.DOCTOR])
    async getAllLocations(@Query('organizationFhirId') organizationFhirId: string) {
        const data = await this.locationsService.getAllLocations(organizationFhirId);
        return new ApiResponseDTO({
            message: 'All locations retrieved successfully',
            length: data.length,
            data,
            statusCode: HttpStatus.OK,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get location by ID' })
    @ApiParam({ name: 'id', description: 'Location ID' })
    @ApiOkResponse({ type: ApiResponseDTO })
    @Roles([Role.ADMIN, Role.DOCTOR])
    async getLocationById(@Param('id') id: string) {
        const data = await this.locationsService.getLocationById(id);
        if (!data) {
            throw new NotFoundException('Location not found');
        }
        return new ApiResponseDTO({
            message: 'Location retrieved successfully',
            data,
            statusCode: HttpStatus.OK,
        });
    }
} 