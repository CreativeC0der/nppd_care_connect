import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthcareService } from './entities/healthcare-service.entity';

@Module({
    imports: [TypeOrmModule.forFeature([HealthcareService])],
    exports: [TypeOrmModule]
})
export class HealthcareServicesModule { } 