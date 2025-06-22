import { Controller } from '@nestjs/common';
import { HealthboxService } from './healthbox.service';

@Controller('healthbox')
export class HealthboxController {
  constructor(private readonly healthboxService: HealthboxService) {}
}
