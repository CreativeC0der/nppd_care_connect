import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('procedures')
@Controller('procedures')
export class ProceduresController {
    constructor(private readonly proceduresService: ProceduresService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new procedure' })
    @ApiResponse({ status: 201, description: 'Procedure created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    create(@Body() createProcedureDto: CreateProcedureDto) {
        return this.proceduresService.create(createProcedureDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all procedures' })
    @ApiResponse({ status: 200, description: 'List of all procedures' })
    findAll() {
        return this.proceduresService.findAll();
    }

    @Get('fhir/:fhirId')
    @ApiOperation({ summary: 'Get procedure by FHIR ID' })
    @ApiParam({ name: 'fhirId', description: 'FHIR ID of the procedure' })
    @ApiResponse({ status: 200, description: 'Procedure found' })
    @ApiResponse({ status: 404, description: 'Procedure not found' })
    findByFhirId(@Param('fhirId') fhirId: string) {
        return this.proceduresService.findByFhirId(fhirId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get procedure by ID' })
    @ApiParam({ name: 'id', description: 'ID of the procedure' })
    @ApiResponse({ status: 200, description: 'Procedure found' })
    @ApiResponse({ status: 404, description: 'Procedure not found' })
    findOne(@Param('id') id: string) {
        return this.proceduresService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a procedure' })
    @ApiParam({ name: 'id', description: 'ID of the procedure to update' })
    @ApiResponse({ status: 200, description: 'Procedure updated successfully' })
    @ApiResponse({ status: 404, description: 'Procedure not found' })
    update(@Param('id') id: string, @Body() updateProcedureDto: UpdateProcedureDto) {
        return this.proceduresService.update(id, updateProcedureDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a procedure' })
    @ApiParam({ name: 'id', description: 'ID of the procedure to delete' })
    @ApiResponse({ status: 200, description: 'Procedure deleted successfully' })
    @ApiResponse({ status: 404, description: 'Procedure not found' })
    remove(@Param('id') id: string) {
        return this.proceduresService.remove(id);
    }

    @Get('organization/:organizationFhirId/stats')
    @ApiOperation({ summary: 'Get procedure and diagnostic report counts grouped by year for an organization' })
    @ApiParam({ name: 'organizationFhirId', description: 'FHIR ID of the organization' })
    getProcedureAndReportCountsByYear(@Param('organizationFhirId') organizationFhirId: string) {
        return this.proceduresService.getProcedureAndReportCountsByYear(organizationFhirId);
    }
} 