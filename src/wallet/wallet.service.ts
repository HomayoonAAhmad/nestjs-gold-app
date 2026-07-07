import { Injectable } from '@nestjs/common';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';

interface IncreaseWalletType {
  userId: number;
  body: {
    amount: number;
  };
}

@Injectable()
export class WalletService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async getWalletBalance(id: number) {
    const walletBalance = await this.prismaService.wallet.findUnique({
      where: {
        user_id: id,
      },
    });

    return walletBalance?.amount;
  }

  async increaseWalletBalance({ userId, body }: IncreaseWalletType) {
    return await this.paymentService.requestGateway({
      userId,
      amount: body.amount,
      description: 'شارژ کیف پول',
      type: 'deposit',
    });
  }
}
