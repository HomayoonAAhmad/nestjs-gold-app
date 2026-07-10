import { Module } from '@nestjs/common';
import { GoldModule } from 'src/gold/gold.module';
import { WalletService } from 'src/wallet/wallet.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { HttpModule } from '@nestjs/axios';
import { UserService } from 'src/user/user.service';
import { PaymentService } from 'src/payment/payment.service';
import { CardsService } from 'src/cards/cards.service';

@Module({
  imports: [GoldModule, HttpModule],
  providers: [
    TransactionsService,
    WalletService,
    UserService,
    PaymentService,
    CardsService,
  ],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
