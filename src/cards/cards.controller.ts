import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CardsService } from './cards.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { createCardDto } from './cards.dto';

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('list')
  getUserCards(@Req() req: Request) {
    const userId = req.user.id;
    return this.cardsService.getCardsList(userId);
  }

  @Post('create')
  createNewCard(@Req() req: Request, @Body() body: createCardDto) {
    const userId = req.user.id;
    return this.cardsService.createNewCard({
      userId,
      body,
    });
  }
}
