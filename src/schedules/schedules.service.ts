import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateScheduleDto } from './dto/create_schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { Slot } from './entities/slot.entity';

import { addMinutes, isAfter, isBefore } from 'date-fns'; // optional for better time handling
import { SlotStatus } from 'src/Utils/enums/slot_status.enum';


@Injectable()
export class SchedulesService {
    constructor(
        @InjectRepository(Schedule)
        private readonly scheduleRepo: Repository<Schedule>,
        @InjectRepository(Practitioner)
        private readonly practitionerRepo: Repository<Practitioner>,
        @InjectRepository(Slot)
        private readonly slotRepo: Repository<Slot>
    ) { }

    async getFilteredSchedules(start: Date, end: Date, specialty: string): Promise<Schedule[]> {
        console.log(start)
        console.log(end)
        return this.scheduleRepo.find({
            where: {
                planningHorizonStart: LessThanOrEqual(end),
                planningHorizonEnd: MoreThanOrEqual(start),
                specialty: ILike(`%${specialty}%`),
            },
            relations: ['actor', 'slots'],
            order: {
                planningHorizonStart: 'ASC',
            },
        });


    }

    async createSchedule(dto: CreateScheduleDto) {
        const practitioner = await this.practitionerRepo.findOne({
            where: { fhirId: dto.practitionerFhirId },
        });

        const existing = await this.scheduleRepo.findOneBy({ fhirId: dto.fhirId });
        if (existing)
            throw new BadRequestException('Duplicate Fhir Id exists');

        if (!practitioner) {
            throw new NotFoundException('Practitioner not found');
        }

        // console.log(dto)

        if (!isBefore(dto.planningHorizonStart, dto.planningHorizonEnd)) {
            throw new BadRequestException('Invalid planning horizon');
        }

        const schedule = this.scheduleRepo.create({
            fhirId: dto.fhirId,
            active: dto.active,
            serviceCategory: dto.serviceCategory,
            serviceType: dto.serviceType,
            specialty: dto.specialty,
            name: dto.name,
            planningHorizonStart: dto.planningHorizonStart,
            planningHorizonEnd: dto.planningHorizonEnd,
            comment: dto.comment,
            actor: practitioner,
        });

        const savedSchedule = await this.scheduleRepo.save(schedule);

        // Generate and link 30-minute slots
        await this.createSlots(savedSchedule);

        return this.scheduleRepo.findOneBy({ id: savedSchedule.id });
    }

    async createSlots(schedule: Schedule): Promise<Slot[]> {
        let { planningHorizonStart: start, planningHorizonEnd: end } = schedule;

        const slots: Slot[] = [];

        while (isBefore(start, end)) {
            const next = addMinutes(start, 30); // 30 min slot

            if (isAfter(next, end)) break;

            const slot = this.slotRepo.create({
                fhirId: `${schedule.fhirId}-${start.getTime()}`,
                schedule,
                start: new Date(start),
                end: new Date(next),
                status: SlotStatus.FREE,
                comment: 'Auto-generated slot',
            });

            slots.push(slot);
            start = next;
        }

        return this.slotRepo.save(slots);
    }

}
