import { Injectable } from '@nestjs/common';
import { PatientsService } from 'src/patients/patients.service';
import { CareplanService } from 'src/careplans/careplans.service';
import { EncountersService } from 'src/encounters/encounters.service';
import { ConditionsService } from 'src/conditions/conditions.service';
import { MedicationsService } from 'src/medications/medications.service';

@Injectable()
export class LoadEhrDataService {
    constructor(
        private patientService: PatientsService,
        private encountersService: EncountersService,
        private careplansService: CareplanService,
        private conditionsService: ConditionsService,
        private medicationsService: MedicationsService,
    ) { }

    async load() {
        const patient = await this.patientService.fetchAndStorePatient();
        console.log('Patient Data Loaded');
        const payload = await this.encountersService.fetchAndSaveEncounters(patient.fhirId);
        console.log('Practitioner and Encounter Data Loaded')
        await this.conditionsService.fetchAndSaveConditions(patient.fhirId);
        console.log('Conditions Loaded');
        await this.careplansService.fetchAndSaveCarePlans(patient.fhirId);
        console.log('Care Plans Loaded')
        await this.medicationsService.fetchAndSaveMedications(patient.fhirId);
        console.log('Medication Data Loaded');
        return payload;
    }

}
