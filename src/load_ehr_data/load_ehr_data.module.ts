import { Module } from '@nestjs/common';
import { LoadEhrDataService } from './load_ehr_data.service';
import { LoadEhrDataController } from './load_ehr_data.controller';
import { PatientsModule } from 'src/patients/patients.module';
import { PractitionersModule } from 'src/practitioners/practitioners.module';
import { CareplansModule } from 'src/careplans/careplans.module';
import { EncountersModule } from 'src/encounters/encounters.module';
import { ConditionsModule } from 'src/conditions/conditions.module';
import { MedicationsModule } from 'src/medications/medications.module';
import { ObservationsModule } from 'src/observations/observations.module';

@Module({
    imports: [PatientsModule, PractitionersModule, CareplansModule, EncountersModule, ConditionsModule, MedicationsModule, ObservationsModule],
    providers: [LoadEhrDataService],
    controllers: [LoadEhrDataController]
})
export class LoadEhrDataModule { }
