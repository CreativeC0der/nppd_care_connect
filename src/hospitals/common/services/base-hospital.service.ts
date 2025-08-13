import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseHospitalService {
    protected validatePatientId(patientId: string): boolean {
        return Boolean(patientId && patientId.length > 0);
    }

    protected formatResponse(data: any, hospital: string) {
        return {
            hospital,
            timestamp: new Date().toISOString(),
            data,
        };
    }
} 