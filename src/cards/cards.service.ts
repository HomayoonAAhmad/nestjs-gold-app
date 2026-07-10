import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createCardDto } from './cards.dto';

interface userId {
  userId: number;
}

interface getSingleCard extends userId {
  cardId: number;
}

@Injectable()
export class CardsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCardsList(userId: number) {
    const cards = await this.prismaService.bankCard.findMany({
      where: {
        user_id: userId,
      },
    });

    // if (!cards) {
    //   throw new NotFoundException('کارت بانکی یافت نشد');
    // }

    return cards;
  }

  async getSingleCard({ userId, cardId }: getSingleCard) {
    const card = await this.prismaService.bankCard.findUnique({
      where: {
        user_id: userId,
        id: cardId,
      },
    });

    if (!card) {
      throw new NotFoundException('کارت بانکی یافت نشد');
    }

    return card;
  }

  async createNewCard({
    userId,
    body,
  }: {
    userId: number;
    body: createCardDto;
  }) {
    const card = await this.prismaService.bankCard.create({
      data: {
        user_id: userId,
        shaba: body.shaba,
        bank_name: body.bank_name,
        card_number: body.card_number,
      },
    });

    return {
      message: 'کارت با موفقیت ساخته و به لیست اضافه شد!',
      card,
    };
  }
}
