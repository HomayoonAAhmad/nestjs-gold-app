import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { ValidatePaymentDto } from './payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('validate')
  async validateGatewayTransaction(
    // @Query('Authority') authority: string,
    // @Query('Status') status: 'OK' | 'NOK',
    @Query() query: ValidatePaymentDto,
    @Res() res: Response,
  ) {
    const result = await this.paymentService.validatePayment({
      authority: query.Authority,
      status: query.Status,
    });

    return res.redirect(`${process.env.FRONT_REDIRECT_URL}?id=${result.id}`);
  }
}
