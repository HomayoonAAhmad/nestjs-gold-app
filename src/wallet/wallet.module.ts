import { Module } from '@nestjs/common';
import { PaymentModule } from 'src/payment/payment.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [PaymentModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
