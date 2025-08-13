import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Encounter } from '../encounters/entities/encounter.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Location, Encounter, Organization])],
    controllers: [LocationsController],
    providers: [LocationsService],
    exports: [TypeOrmModule, LocationsService]
})
export class LocationsModule { } 