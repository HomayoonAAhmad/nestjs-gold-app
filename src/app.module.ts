import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GoldModule } from './gold/gold.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { PaymentModule } from './payment/payment.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    GoldModule,
    ScheduleModule.forRoot(),
    TransactionsModule,
    WalletModule,
    PaymentModule,
    CardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
