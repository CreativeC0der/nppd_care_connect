import { Injectable } from '@nestjs/common';
import { PatientsService } from 'src/patients/patients.service';
import {log} from 'console';

@Injectable()
export class LoadEhrDataService {
    constructor(private patientService:PatientsService){}

    async load() {
        const patient=await this.patientService.fetchAndStorePatient();
        console.log('Patient Data Loaded');
        log(patient);
    }
}
