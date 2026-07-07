import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TransactionType } from 'generated/prisma/enums';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { BuyGoldDto, SellGoldDto } from './transactions.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  getTransactions(@Req() req: Request, @Query('type') type: TransactionType) {
    return this.transactionsService.getTransactions({
      userId: req.user.id,
      type: type,
    });
  }

  @Get(':id')
  getSingleTransaction(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionsService.getSingleTransaction({
      userId: req.user.id,
      id: id,
    });
  }

  @Post('buy')
  buyGoldTransaction(@Req() req: Request, @Body() body: BuyGoldDto) {
    return this.transactionsService.createTransaction({
      userId: req.user.id,
      body,
    });
  }

  @Post('sell')
  sellGoldTransaction(@Req() req: Request, @Body() body: SellGoldDto) {
    return this.transactionsService.sellGoldTransaction({
      userId: req.user.id,
      body,
    });
  }
}
