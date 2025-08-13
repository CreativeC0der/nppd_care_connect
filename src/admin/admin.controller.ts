import { BadRequestException, Body, Controller, HttpStatus, InternalServerErrorException, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { CreateAdminDto } from './dto/create_admin.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Public } from 'src/Utils/decorators/public.decorator';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class AdminController {

    constructor(private readonly adminService: AdminService) { }

    @Post('/create')
    @Public()
    @ApiResponse({ status: HttpStatus.CREATED, type: ApiResponseDTO })
    async createAdmin(@Body() adminData: CreateAdminDto) {
        try {
            const payload = await this.adminService.createAdmin(adminData);
            return new ApiResponseDTO({
                message: 'Admin Created Successfully',
                statusCode: HttpStatus.CREATED,
                data: payload
            });
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;

            throw new InternalServerErrorException('Admin Creation Failed! with error: ' + err.message);
        }
    }
} 