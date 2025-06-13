import { Module } from '@nestjs/common';
import { CareplansController } from './careplans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarePlan } from './entities/careplan.entity';
import { CarePlanActivity } from './entities/careplan-activity.entity';
import { CareplanService } from './careplans.service';
import { HttpModule } from '@nestjs/axios';
import { Patient } from 'src/patients/entities/patient.entity';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import { RedisModule } from 'src/Utils/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([CarePlan, CarePlanActivity, Patient, Encounter, Condition]), HttpModule, RedisModule],
  controllers: [CareplansController],
  providers: [CareplanService],
  exports: [CareplanService, TypeOrmModule]
})
export class CareplansModule { }
