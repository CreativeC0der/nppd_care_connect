import { Module } from '@nestjs/common';
import { NutritionProductService } from './nutrition-product.service';
import { NutritionProductController } from './nutrition-product.controller';

@Module({
  controllers: [NutritionProductController],
  providers: [NutritionProductService],
})
export class NutritionProductModule {}
