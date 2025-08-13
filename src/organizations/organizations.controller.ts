import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, InternalServerErrorException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { CreateOrganizationDto } from './dto/create_organization.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Organization } from './entities/organization.entity';
import { NotFoundException } from '@nestjs/common';

@Controller('organizations')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class OrganizationsController {

    constructor(private readonly organizationsService: OrganizationsService) { }

    @Post('/create')
    @Roles([Role.DOCTOR, Role.ADMIN])
    @ApiResponse({ status: HttpStatus.CREATED, type: ApiResponseDTO })
    async createOrganization(@Body() organizationData: CreateOrganizationDto) {
        try {
            const payload = await this.organizationsService.createOrganization(organizationData);
            return new ApiResponseDTO({
                message: 'Organization Created Successfully',
                statusCode: HttpStatus.CREATED,
                data: payload
            });
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;

            throw new InternalServerErrorException('Creation Failed! with error: ' + err.message);
        }
    }

    @Get('get-all')
    @ApiOkResponse({
        description: 'List of all organizations',
        type: ApiResponseDTO,
    })
    @Roles([Role.DOCTOR, Role.ADMIN])
    async getAllOrganizations() {
        try {
            const payload = await this.organizationsService.getAllOrganizations();
            return new ApiResponseDTO({
                message: 'Organizations Retrieved Successfully',
                statusCode: HttpStatus.OK,
                data: payload
            });
        }
        catch (err) {
            console.error(err);
            throw new InternalServerErrorException('Retrieval Failed ' + err.message);
        }
    }

    @Get('/get-by-id/:id')
    @ApiOkResponse({
        description: 'Get organization by ID',
        type: ApiResponseDTO,
    })
    @Roles([Role.DOCTOR, Role.ADMIN])
    async getOrganizationById(@Param('id') id: string) {
        try {
            const payload = await this.organizationsService.getOrganizationById(id);
            return new ApiResponseDTO({
                message: 'Organization Retrieved Successfully',
                statusCode: HttpStatus.OK,
                data: payload
            });
        }
        catch (err) {
            console.error(err);
            throw new InternalServerErrorException('Retrieval Failed ' + err.message);
        }
    }

    @Get('/get-by-user')
    @ApiOperation({ summary: 'Get organization by admin FHIR ID' })
    @ApiOkResponse({
        description: 'Get organization by admin FHIR ID',
        type: ApiResponseDTO,
    })
    @ApiQuery({ name: 'userFhirId', type: String })
    @ApiQuery({ name: 'role', type: String, enum: Role })
    @Roles([Role.DOCTOR, Role.ADMIN, Role.PATIENT])
    async getOrganizationByUserFhirId(@Query('userFhirId') userFhirId: string, @Query('role') role: string) {
        try {
            let payload: Organization[] = [];
            if (role === Role.PATIENT) {
                payload = await this.organizationsService.getOrganizationByPatientFhirId(userFhirId);
            }
            else if (role === Role.DOCTOR) {
                payload = await this.organizationsService.getOrganizationByPractitionerFhirId(userFhirId);
            }
            else if (role === Role.ADMIN) {
                payload = await this.organizationsService.getOrganizationByAdminFhirId(userFhirId);
            }
            else {
                throw new BadRequestException('Invalid user role');
            }
            return new ApiResponseDTO({
                message: 'Organization Retrieved Successfully',
                statusCode: HttpStatus.OK,
                data: payload
            });
        }
        catch (err) {
            console.error(err);
            if (err instanceof NotFoundException)
                throw err;
            throw new InternalServerErrorException('Retrieval Failed ' + err.message);
        }
    }

    @Put('update-by-id/:id')
    @ApiOkResponse({
        description: 'Update organization',
        type: ApiResponseDTO,
    })
    @Roles([Role.DOCTOR, Role.ADMIN])
    async updateOrganization(@Param('id') id: string, @Body() updateData: Partial<CreateOrganizationDto>) {
        try {
            const payload = await this.organizationsService.updateOrganization(id, updateData);
            return new ApiResponseDTO({
                message: 'Organization Updated Successfully',
                statusCode: HttpStatus.OK,
                data: payload
            });
        }
        catch (err) {
            console.error(err);
            throw new InternalServerErrorException('Update Failed ' + err.message);
        }
    }

    @Delete('delete-by-id/:id')
    @ApiOkResponse({
        description: 'Delete organization',
        type: ApiResponseDTO,
    })
    @Roles([Role.DOCTOR, Role.ADMIN])
    async deleteOrganization(@Param('id') id: string) {
        try {
            await this.organizationsService.deleteOrganization(id);
            return new ApiResponseDTO({
                message: 'Organization Deleted Successfully',
                statusCode: HttpStatus.OK,
                data: null
            });
        }
        catch (err) {
            console.error(err);
            throw new InternalServerErrorException('Deletion Failed ' + err.message);
        }
    }
} 