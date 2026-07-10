import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GoldService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}
  async getGoldPrice() {
    try {
      const gold_price = await this.prismaService.goldPrice.findFirst({
        orderBy: { created_at: 'desc' },
      });
      return {
        price: gold_price?.price,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('مشکلی رخ داده است', 500);
    }
  }

  async getGoldChart() {
    try {
      const response = await firstValueFrom<AxiosResponse<unknown>>(
        this.httpService.get(process.env.GOLD_CHART_API!),
      );

      return response.data;
    } catch (error) {
      console.log(error);
      throw new HttpException('مشکلی رخ داده است', 500);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  // @Cron(CronExpression.EVERY_SECOND)
  // @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(process.env.GOLD_PRICE_API!),
      );

      const price = Math.round(response?.data?.gold18?.price / 10);

      if (!price) {
        return;
      }

      await this.prismaService.goldPrice.create({
        data: {
          price: price,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clearOldPrices() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await this.prismaService.goldPrice.deleteMany({
      where: {
        created_at: {
          lt: yesterday,
        },
      },
    });
  }
}
