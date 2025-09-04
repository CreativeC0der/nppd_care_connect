import { Controller, Get, Post, Body, Patch, Param, Req, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../Utils/guards/auth.guard';
import { RolesGuard } from '../Utils/guards/role.guard';
import { Roles } from '../Utils/decorators/roles.decorator';
import { Role } from '../Utils/enums/role.enum';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthenticatedRequest } from 'src/Utils/classes/request.interface';

@ApiTags('procedures')
@Controller('procedures')
@UseGuards(AuthGuard, RolesGuard)
export class ProceduresController {
    constructor(private readonly proceduresService: ProceduresService) { }

    @Post()
    @Roles([Role.ADMIN, Role.DOCTOR])
    @ApiOperation({ summary: 'Create a new procedure' })
    @ApiResponse({ status: 201, description: 'Procedure created successfully' })
    create(@Body() createProcedureDto: CreateProcedureDto) {
        return this.proceduresService.create(createProcedureDto);
    }

    @Get()
    @Roles([Role.ADMIN, Role.DOCTOR])
    @ApiOperation({ summary: 'Get all procedures' })
    @ApiResponse({ status: 200, description: 'List of all procedures', type: ApiResponseDTO })
    @ApiQuery({ name: 'organizationFhirId', description: 'FHIR ID of the organization' })
    async findAll(@Query('organizationFhirId') organizationFhirId: string, @Req() req: AuthenticatedRequest) {
        try {
            const practitionerId = req.user.role === Role.DOCTOR ? req.user.id : undefined;
            const data = await this.proceduresService.findAll(organizationFhirId, practitionerId);
            return new ApiResponseDTO({ statusCode: HttpStatus.OK, data, message: 'List of all procedures', length: data.length });
        } catch (error) {
            return new ApiResponseDTO({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, data: null, message: 'Error fetching procedures' });
        }
    }

    @Get('fhir/:fhirId')
    @Roles([Role.ADMIN, Role.DOCTOR])
    @ApiOperation({ summary: 'Get procedure by FHIR ID' })
    @ApiParam({ name: 'fhirId', description: 'FHIR ID of the procedure' })
    @ApiResponse({ status: 200, description: 'Procedure found' })
    @ApiResponse({ status: 404, description: 'Procedure not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
    findByFhirId(@Param('fhirId') fhirId: string) {
        return this.proceduresService.findByFhirId(fhirId);
    }

    @Get('organization/:organizationFhirId/stats')
    @Roles([Role.ADMIN])
    @ApiOperation({ summary: 'Get procedure and diagnostic report counts grouped by year for an organization' })
    @ApiParam({ name: 'organizationFhirId', description: 'FHIR ID of the organization' })
    @ApiResponse({ status: 200, description: 'Procedure and report counts by year' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
    getProcedureAndReportCountsByYear(@Param('organizationFhirId') organizationFhirId: string) {
        return this.proceduresService.getProcedureAndReportCountsByYear(organizationFhirId);
    }

    @Get('organization/:organizationFhirId/category-stats')
    @Roles([Role.ADMIN, Role.DOCTOR])
    @ApiOperation({ summary: 'Get procedure count grouped by category for an organization', description: 'Returns procedure counts grouped by category. If the user is a doctor, results are filtered to only show procedures from encounters where they are the practitioner.' })
    @ApiParam({ name: 'organizationFhirId', description: 'FHIR ID of the organization' })
    @ApiResponse({ status: 200, description: 'Procedure counts by category', type: ApiResponseDTO })
    async getProcedureCountByCategory(
        @Param('organizationFhirId') organizationFhirId: string,
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponseDTO> {
        const practitionerId = req.user.role === Role.DOCTOR ? req.user.id : undefined;
        const data = await this.proceduresService.getProcedureCountByCategory(organizationFhirId, practitionerId);
        return new ApiResponseDTO({ statusCode: HttpStatus.OK, data, message: 'Procedure counts by category' });
    }
} 