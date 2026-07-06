import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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

  //   @Cron(CronExpression.EVERY_MINUTE)
  //   @Cron(CronExpression.EVERY_SECOND)
  async handleCron() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(process.env.GOLD_API!),
      );

      const price = response?.data?.gold18?.price;

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
}
