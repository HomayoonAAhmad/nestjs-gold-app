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
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
  BuyGoldDto,
  getTransactionDto,
  SellGoldDto,
  WithdrawTransactionDto,
} from './transactions.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  getTransactions(@Req() req: Request, @Query() query: getTransactionDto) {
    return this.transactionsService.getTransactions({
      userId: req.user.id,
      type: query.type,
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

  @Post('withdraw')
  withdrawTransaction(
    @Req() req: Request,
    @Body() body: WithdrawTransactionDto,
  ) {
    return this.transactionsService.withdrawTransaction({
      userId: req.user.id,
      body,
    });
  }
}
