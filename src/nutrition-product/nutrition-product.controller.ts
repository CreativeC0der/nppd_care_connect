import { Controller } from '@nestjs/common';
import { NutritionProductService } from './nutrition-product.service';

@Controller('nutrition-product')
export class NutritionProductController {
  constructor(private readonly nutritionProductService: NutritionProductService) {}
}
