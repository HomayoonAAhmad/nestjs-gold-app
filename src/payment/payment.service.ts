import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentType, TransactionType } from 'generated/prisma/enums';
import { firstValueFrom } from 'rxjs';
import { GoldService } from 'src/gold/gold.service';
import { PrismaService } from 'src/prisma/prisma.service';

interface ValidateGatewayCallback {
  authority: string;
  status: 'OK' | 'NOK';
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly goldService: GoldService,
    private readonly httpService: HttpService,
  ) {}

  async requestGateway({
    amount,
    userId,
    description = 'خرید طلا',
    type = TransactionType.buy,
  }: {
    amount: number;
    userId: number;
    description?: string;
    type?: TransactionType;
  }) {
    const goldPrice = await this.goldService.getGoldPrice();
    const goldAmount = amount / goldPrice.price!;

    const { data } = await firstValueFrom(
      this.httpService.post(process.env.ZARINPAL_GATEWAY_URL!, {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount,
        callback_url: process.env.ZARINPAL_CALLBACK_URL,
        description: description,
        currency: 'IRT',
      }),
    );

    if (data.data.code !== 100) {
      throw new BadRequestException(data.data.message);
    }

    const transaction = await this.prismaService.transaction.create({
      data: {
        user_id: userId,
        total_amount: amount,
        authority: data.data.authority as string,
        ...((type === 'sell' || type === 'buy') && {
          gold_amount: Math.round(goldAmount),
          price_per_milligram: goldPrice.price!,
        }),
        payment_type: PaymentType.gateway,
        type: type,
      },
    });

    return {
      transaction_id: transaction.id,
      message:
        'عملیات با موفقیت انجام شد تا چند ثانیه دیگر به درگاه هدایت خواهید شد',
      gateway_url: `${process.env.ZARINPAL_PAY_URL}/${data.data.authority}`,
    };
  }

  async validatePayment({ authority, status }: ValidateGatewayCallback) {
    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        authority: authority,
      },
    });

    if (!transaction)
      throw new NotFoundException('تراکنش مورد نظر شما یافت نشد');

    if (status === 'NOK') {
      await this.prismaService.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: 'failed',
        },
      });

      return {
        success: true,
        id: transaction.id,
      };
    }

    const { data } = await firstValueFrom(
      this.httpService.post(process.env.ZARINPAL_VALIDATE_URL!, {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: transaction.total_amount,
        authority: transaction.authority,
      }),
    );

    if (data.data.code === 100) {
      await this.prismaService.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { user_id: transaction.user_id },
          data: {
            ...(transaction.type === 'buy' && {
              gold_amount: {
                increment: transaction.gold_amount!,
              },
            }),
            ...(transaction.type === 'deposit' && {
              amount: {
                increment: transaction.total_amount,
              },
            }),
          },
        });
        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: 'success',
          },
        });
      });
    } else if (data.data.code !== 101) {
      await this.prismaService.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: 'failed',
        },
      });
    }

    return {
      success: true,
      id: transaction.id,
    };
  }
}
