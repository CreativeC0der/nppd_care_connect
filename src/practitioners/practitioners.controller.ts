import { Controller } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';

@Controller('practitioners')
export class PractitionersController {
  constructor(private readonly practitionersService: PractitionersService) {}
}
