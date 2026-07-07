import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('validate')
  async validateGatewayTransaction(
    @Query('Authority') authority: string,
    @Query('Status') status: 'OK' | 'NOK',
    @Res() res: Response,
  ) {
    const result = await this.paymentService.validatePayment({
      authority,
      status,
    });

    return res.redirect(`${process.env.FRONT_REDIRECT_URL}?id=${result.id}`);
  }
}
