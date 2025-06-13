import { Controller, Get, Param, Query } from '@nestjs/common';
import { LoadEhrDataService } from './load_ehr_data.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('load-ehr-data')
export class LoadEhrDataController {
    constructor(private loadEhrDataService: LoadEhrDataService) { }
    @Get('/loadData')
    @ApiQuery({ name: 'fhir_id', type: 'string', required: false })
    async loadData(@Query('fhir_id') fhirId?: string) {
        return this.loadEhrDataService.load(fhirId);
    }
}
