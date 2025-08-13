import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service';
import { HospitalAModule } from './hospital-a/hospital-a.module';

@Module({
    imports: [
        HttpModule,
        HospitalAModule,
    ],
    controllers: [HospitalController],
    providers: [HospitalService],
    exports: [HospitalService],
})
export class HospitalModule { } 