import { Module } from '@nestjs/common';
import { HealthboxService } from './healthbox.service';
import { HealthboxController } from './healthbox.controller';

@Module({
  controllers: [HealthboxController],
  providers: [HealthboxService],
})
export class HealthboxModule {}
