import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Organization, Admin, Encounter])],
    controllers: [OrganizationsController],
    providers: [OrganizationsService],
    exports: [OrganizationsService, TypeOrmModule]
})
export class OrganizationsModule { } 