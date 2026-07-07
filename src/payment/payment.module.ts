import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { GoldModule } from 'src/gold/gold.module';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from './payment.controller';

@Module({
  imports: [GoldModule, HttpModule],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
