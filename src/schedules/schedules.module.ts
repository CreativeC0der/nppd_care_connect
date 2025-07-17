import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { Schedule } from './entities/schedule.entity';
import { Slot } from './entities/slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Practitioner, Slot])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule { }
