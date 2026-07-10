import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoldService } from './gold.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('gold')
@UseGuards(AuthGuard)
export class GoldController {
  constructor(private readonly goldService: GoldService) {}
  @Get('price')
  getGoldPrice() {
    return this.goldService.getGoldPrice();
  }

  @Get('chart')
  getGoldChart() {
    return this.goldService.getGoldChart();
  }
}
