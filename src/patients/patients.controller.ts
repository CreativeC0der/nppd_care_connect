import { Controller, Get, Param } from '@nestjs/common';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientService: PatientsService) { }

  @Get(':id/sync')
  syncPatient(@Param('id') id: string) {
    return this.patientService.fetchAndStorePatient(id);
  }
}
