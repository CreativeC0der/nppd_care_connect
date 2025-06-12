import { Controller, Get } from '@nestjs/common';
import { LoadEhrDataService } from './load_ehr_data.service';
import { ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';

@Controller('load-ehr-data')
export class LoadEhrDataController {
    constructor(private loadEhrDataService: LoadEhrDataService) { }

    @Get('/loadData')
    @ApiResponse({ type: ApiResponseDTO })
    async loadData() {
        return this.loadEhrDataService.load();
    }
}
