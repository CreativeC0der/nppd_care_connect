import { Controller, Get, Param, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { HospitalService } from './hospital.service';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';

@Controller('hospitals')
export class HospitalController {
    constructor(private readonly hospitalService: HospitalService) { }

    @Get('/sync/:hospitalId')
    @ApiOperation({ summary: 'Sync all data from a specific hospital' })
    @ApiParam({
        name: 'hospitalId',
        description: 'Hospital identifier (e.g., hospital-a, hospital-b)',
        example: 'hospital-a'
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully synced all hospital data',
        type: ApiResponseDTO
    })
    async syncAll(@Param('hospitalId') hospitalId: string) {
        try {
            const result = await this.hospitalService.syncAll(hospitalId);
            return new ApiResponseDTO({
                message: `Successfully synced all data from ${hospitalId}`,
                statusCode: HttpStatus.OK,
                data: result
            });
        } catch (error) {
            console.error(`Error syncing hospital ${hospitalId}:`, error);

            if (error.message.includes('Hospital adapter not found')) {
                throw new InternalServerErrorException(`Hospital '${hospitalId}' not found or not configured`);
            }

            throw new InternalServerErrorException(`Error syncing data from hospital '${hospitalId}': ${error.message}`);
        }
    }
} 