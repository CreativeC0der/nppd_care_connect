import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MailerModule } from '../mailer/mailer.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [MailerModule, RedisModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService]
})
export class OtpModule { }
