import { Controller, Get, Param, Query } from '@nestjs/common';
import { LoadEhrDataService } from './load_ehr_data.service';
import { ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('load-ehr-data')
export class LoadEhrDataController {
    constructor(private loadEhrDataService: LoadEhrDataService) { }
    @Get('/loadData')
    @ApiResponse({ type: ApiResponseDTO })
    @ApiQuery({ name: 'fhir_id', type: 'string', required: false })
    async loadData(@Query('fhir_id') fhirId?: string) {
        return this.loadEhrDataService.load(fhirId);
    }
}
