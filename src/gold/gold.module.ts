import { Module } from '@nestjs/common';
import { GoldService } from './gold.service';
import { GoldController } from './gold.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [GoldService],
  controllers: [GoldController],
})
export class GoldModule {}
