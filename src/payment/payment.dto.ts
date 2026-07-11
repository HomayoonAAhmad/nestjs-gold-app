import { IsIn, IsNotEmpty } from 'class-validator';

export class ValidatePaymentDto {
  @IsNotEmpty({
    message: 'فیلد Authority نباید خالی باشد',
  })
  Authority!: string;

  @IsNotEmpty({
    message: 'وضعیت تراکنش ارسال نشده',
  })
  @IsIn(['OK', 'NOK'])
  Status!: 'OK' | 'NOK';
}
