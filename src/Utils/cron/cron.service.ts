import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '../mailer/mailer.service';
import Redis from 'ioredis';
@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    constructor(private mailerService: MailerService,
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        const receivers = JSON.parse(await this.redisClient.get('notification-mails') ?? '[]');

        // send mail to all patients
        for (const receiver of receivers) {
            this.mailerService.sendMail({
                mailData: {
                    receivers: [receiver],
                    subject: 'Care Connect Notification',
                    params: { name: receiver.name },
                    sender: { email: process.env.SENDER_EMAIL, name: 'NPPD CARE CONNECT' }
                },
                template: 'test',
            })
        }

        this.logger.debug('Called every day at midnight');
    }
}
