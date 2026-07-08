import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentType, TransactionType } from 'generated/prisma/enums';
import { GoldService } from 'src/gold/gold.service';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { WalletService } from 'src/wallet/wallet.service';

interface getTransactions {
  userId: number;
  type: TransactionType;
}

interface getSingleTransaction {
  userId: number;
  id: number;
}

interface createTransaction {
  userId: number;
  body: {
    amount: number;
    payment_type: PaymentType;
  };
}

interface sellTransaction {
  userId: number;
  body: {
    gold_amount: number;
  };
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly walletService: WalletService,
    private readonly goldService: GoldService,
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
  ) {}

  async getTransactions({ userId, type }: getTransactions) {
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        user_id: userId,
        type: type,
      },
    });

    return transactions;
  }

  async getSingleTransaction({ userId, id }: getSingleTransaction) {
    const singleTransaction = await this.prismaService.transaction.findUnique({
      where: {
        user_id: userId,
        id: id,
      },
    });

    if (!singleTransaction)
      throw new NotFoundException('تراکنش مورد نظر شما یافت نشد');

    return singleTransaction;
  }

  private async buyWithWallet(userId: number, amount: number) {
    const balance = await this.walletService.getWalletBalance(userId);
    const goldPrice = await this.goldService.getGoldPrice();

    if (balance! < amount)
      throw new UnprocessableEntityException(
        'موجودی کیف پول کمتر از مبلغ درخواستی است',
      );

    const gold_amount = amount / goldPrice.price!;

    const result = await this.prismaService.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: {
          user_id: userId,
        },
        data: {
          gold_amount: {
            increment: Math.round(gold_amount),
          },
          amount: {
            decrement: amount,
          },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          user_id: userId,
          total_amount: amount,
          gold_amount: Math.round(gold_amount),
          price_per_milligram: goldPrice.price as number,
          payment_type: PaymentType.wallet,
          type: TransactionType.buy,
          status: 'success',
        },
      });

      return {
        wallet,
        transaction,
      };
    });

    return {
      code: 200,
      message: `خرید با موفقیت انجام شد، مبلغ ${amount} از کیف پول شما کسر و مقدار ${Math.round(gold_amount)} میلی گرم به دارایی شما افزوده شد!`,
      result,
    };
  }

  private async buyWithGateway(userId: number, amount: number) {
    if (!amount) throw new BadRequestException('مبلغ ارسال نشده');

    return await this.paymentService.requestGateway({
      userId,
      amount,
    });
  }

  async createTransaction({ userId, body }: createTransaction) {
    switch (body.payment_type) {
      case 'wallet':
        return this.buyWithWallet(userId, body.amount);

      case 'gateway':
        return this.buyWithGateway(userId, body.amount);
    }
  }

  async sellGoldTransaction({ userId, body }: sellTransaction) {
    const assets = await this.userService.getUserGoldBalance(userId);
    const goldPrice = await this.goldService.getGoldPrice();

    if (assets.gold < body.gold_amount) {
      throw new ConflictException('موجودی طلای شما کافی نیست');
    }

    const amount = body.gold_amount * goldPrice.price!;

    const result = await this.prismaService.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { user_id: userId },
        data: {
          gold_amount: {
            decrement: body.gold_amount,
          },
          amount: {
            increment: amount,
          },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          user_id: userId,
          type: 'sell',
          price_per_milligram: goldPrice.price as number,
          gold_amount: body.gold_amount,
          total_amount: amount,
          status: 'success',
        },
      });

      return {
        wallet,
        transaction,
      };
    });

    return {
      code: 200,
      message: `عملیات با موفقیت انجام شد مبلغ "${amount}" به کیف پول شما افزوده شد`,
      result,
    };
  }
}
