import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  PaymentType,
  TransactionStatus,
  TransactionType,
} from 'generated/prisma/enums';
import { CardsService } from 'src/cards/cards.service';
import { GoldService } from 'src/gold/gold.service';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { WalletService } from 'src/wallet/wallet.service';
import { Cron, CronExpression } from '@nestjs/schedule';

interface userId {
  userId: number;
}

interface getTransactions extends userId {
  type: TransactionType;
}

interface getSingleTransaction extends userId {
  id: number;
}

interface createTransaction extends userId {
  body: {
    amount: number;
    payment_type: PaymentType;
  };
}

interface sellTransaction extends userId {
  body: {
    gold_amount: number;
  };
}

interface withdrawTransaction extends userId {
  body: {
    amount: number;
    // shaba: string;
    // bank_name: string;
    card_id: number;
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
    private readonly cardService: CardsService,
  ) {}

  async getTransactions({ userId, type }: getTransactions) {
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        user_id: userId,
        type: type,
      },
      ...(type === TransactionType.withdraw && {
        include: {
          bank_card: true,
        },
      }),
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

  async withdrawTransaction({ userId, body }: withdrawTransaction) {
    const balance = await this.walletService.getWalletBalance(userId);

    if (balance! < body.amount)
      throw new UnprocessableEntityException(
        'موجودی کیف پول کمتر از مبلغ درخواستی است',
      );

    const card = await this.cardService.getSingleCard({
      cardId: body.card_id,
      userId: userId,
    });

    const transaction = await this.prismaService.$transaction(async (tx) => {
      const pending = await tx.transaction.findFirst({
        where: {
          user_id: userId,
          type: TransactionType.withdraw,
          status: TransactionStatus.pending,
        },
      });

      if (pending) {
        throw new ConflictException(
          'درخواست برداشت قبلی هنوز در حال بررسی است',
        );
      }

      return await tx.transaction.create({
        data: {
          user_id: userId,
          total_amount: body.amount,
          payment_type: PaymentType.wallet,
          type: TransactionType.withdraw,
          status: 'pending',
          bank_card_id: card?.id,
        },
      });
    });

    return {
      message: 'درخواست برداشت از کیف پول شما با موفقیت ثبت شد',
      transaction,
    };
  }

  // @Cron(CronExpression.EVERY_8_HOURS)
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      const transactions = await this.prismaService.transaction.findMany({
        where: {
          status: 'pending',
          type: 'withdraw',
        },
      });
      for (const transaction of transactions) {
        try {
          await this.prismaService.$transaction(async (tx) => {
            await tx.wallet.update({
              where: {
                user_id: transaction.user_id,
              },
              data: {
                amount: {
                  decrement: transaction.total_amount,
                },
              },
            });
            await tx.transaction.update({
              where: {
                id: transaction.id,
              },
              data: {
                status: TransactionStatus.success,
              },
            });
          });
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
