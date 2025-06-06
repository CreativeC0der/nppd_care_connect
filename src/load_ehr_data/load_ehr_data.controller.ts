import { Controller, Get } from '@nestjs/common';
import { LoadEhrDataService } from './load_ehr_data.service';

@Controller('load-ehr-data')
export class LoadEhrDataController {
    constructor(private loadEhrDataService:LoadEhrDataService){}

    @Get('/loadData')
    async loadData(){
        await this.loadEhrDataService.load();
    }
}
