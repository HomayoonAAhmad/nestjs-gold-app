import { Injectable } from '@nestjs/common';
import { GoldService } from 'src/gold/gold.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly goldService: GoldService,
  ) {}
  async getUserData(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        wallet: {
          select: {
            amount: true,
          },
        },
      },
    });
    return {
      message: 'با موفقیت انجام شد',
      code: 200,
      user,
    };
  }

  updateUserData(userId: number) {
    return userId;
  }

  async getUserAssets(userId: number) {
    const [{ gold }, goldPrice, buy] = await Promise.all([
      this.getUserGoldBalance(userId),
      this.goldService.getGoldPrice(),
      this.prismaService.transaction.aggregate({
        where: {
          user_id: userId,
          status: 'success',
          type: 'buy',
        },
        _sum: {
          gold_amount: true,
          total_amount: true,
        },
      }),
    ]);

    const averagePrice =
      (buy._sum.total_amount ?? 0) / (buy._sum.gold_amount ?? 1);

    const asset = gold * goldPrice.price!;

    const cost = gold * averagePrice;

    const profit = Math.round(asset - cost);

    const profitPercent = Math.round(cost === 0 ? 0 : (profit / cost) * 100);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const prices = await this.prismaService.goldPrice.findMany({
      where: {
        created_at: {
          gte: since,
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    const chart = prices.map((price) => ({
      time: price.created_at,
      asset: price.price * gold,
    }));

    return {
      gold,
      asset,
      profit,
      profitPercent,
      chart,
    };
  }

  async getUserGoldBalance(userId: number) {
    const result = await this.prismaService.transaction.groupBy({
      by: ['type'],
      where: {
        user_id: userId,
        status: 'success',
      },
      _sum: {
        gold_amount: true,
      },
    });

    const buy =
      result.find((item) => item.type === 'buy')?._sum.gold_amount ?? 0;

    const sell =
      result.find((item) => item.type === 'sell')?._sum.gold_amount ?? 0;

    return {
      gold: buy - sell,
    };
  }
}
