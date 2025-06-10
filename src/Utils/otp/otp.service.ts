import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import Redis from 'ioredis';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class OtpService {
    constructor(
        @Inject('REDIS_CLIENT') private redisClient: Redis,
        private mailService: MailerService) { }

    async generateOtp(email: string, name: string) {
        const otp = randomInt(100000, 999999); // 6-digit OTP
        await this.redisClient.set(`otp:${email}`, otp, 'EX', 3 * 60); // Set the OTP for 3 minutes
        return this.mailService.sendMail({
            mailData: {
                receivers: [{ email, name }],
                subject: 'Your OTP for Verification',
                params: { name, otp },
                sender: { email: process.env.SENDER_EMAIL, name: 'NPPD CARE CONNECT' }
            },
            template: 'otp_signin',
            attachments: []
        });
    }

    async validateOtp(email: string, providedOtp: number) {
        const storedOtp = await this.redisClient.get(`otp:${email}`);
        if (storedOtp && parseInt(storedOtp, 10) === providedOtp) {
            return true;
        }
        return false;
    }

}
