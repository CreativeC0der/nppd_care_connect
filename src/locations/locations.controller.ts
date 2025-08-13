import { Controller, Get, Query, Param, UseGuards, BadRequestException, NotFoundException, HttpStatus } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationUtilizationDto } from './dto/location-utilization.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiParam, ApiOkResponse } from '@nestjs/swagger';
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
} 