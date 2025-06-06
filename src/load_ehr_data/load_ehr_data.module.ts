import { Module } from '@nestjs/common';
import { LoadEhrDataService } from './load_ehr_data.service';
import { LoadEhrDataController } from './load_ehr_data.controller';
import { PatientsModule } from 'src/patients/patients.module';

@Module({
    imports:[PatientsModule],
    providers:[LoadEhrDataService],
    controllers:[LoadEhrDataController]
})
export class LoadEhrDataModule {}
