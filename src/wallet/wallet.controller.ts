import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { WalletService } from './wallet.service';
import { IncreaseWalletBalanceDto } from './wallet.dto';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWalletBalance(@Req() req: Request) {
    return this.walletService.getWalletBalance(req.user.id);
  }

  @Post('increase')
  increaseWalletBalance(
    @Req() req: Request,
    @Body() body: IncreaseWalletBalanceDto,
  ) {
    return this.walletService.increaseWalletBalance({
      userId: req.user.id,
      body: body,
    });
  }
}
