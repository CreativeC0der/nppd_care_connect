import { Injectable } from '@nestjs/common';
import { HospitalAService } from './hospital-a/hospital-a.service';
import { HospitalAdapter } from 'src/Utils/classes/hospitalAdapter';

@Injectable()
export class HospitalService {
    private adapters: Map<string, HospitalAdapter> = new Map();

    constructor(private readonly hospitalAAdapter: HospitalAService) {
        this.adapters.set('hospital-a', this.hospitalAAdapter);
    }

    getAdapter(hospitalId: string): HospitalAdapter {
        const adapter = this.adapters.get(hospitalId);
        if (!adapter) {
            throw new Error(`Hospital adapter not found for: ${hospitalId}`);
        }
        return adapter;
    }

    async syncAll(hospitalId: string): Promise<any> {
        const adapter = this.getAdapter(hospitalId);
        return adapter.syncAll();
    }
} 