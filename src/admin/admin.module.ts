import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Organization } from 'src/organizations/entities/organization.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Admin, Organization]), AuthModule],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService, TypeOrmModule]
})
export class AdminModule { } 