import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '../mailer/mailer.service';
import Redis from 'ioredis';
import { CarePlan } from 'src/careplans/entities/careplan.entity';
@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    constructor(private mailerService: MailerService,
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        try {
            const receivers: Record<string, CarePlan> = JSON.parse(await this.redisClient.get('care-plan-notifications') ?? '{}');

            // send mail to all patients
            for (const carePlan of Object.values(receivers)) {
                this.mailerService.sendMail({
                    mailData: {
                        receivers: [{
                            name: `${carePlan.patient.firstName} ${carePlan.patient.lastName}`,
                            email: carePlan.patient.email
                        }],
                        subject: 'Care Connect Notification',
                        params: { ...carePlan },
                        sender: { email: process.env.SENDER_EMAIL, name: 'NPPD CARE CONNECT' }
                    },
                    template: 'daily_reminder',
                })
            }

            console.log('Cron service called')
        }
        catch (error) {
            console.error(error)
        }
    }
}
