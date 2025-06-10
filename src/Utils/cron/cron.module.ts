import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { MailerModule } from '../mailer/mailer.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [MailerModule, RedisModule],
  controllers: [],
  providers: [CronService],
})
export class CronModule { }
