import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { PaymentType } from 'generated/prisma/enums';

export class BuyGoldDto {
  @IsNotEmpty({ message: 'مبلغ نمیتواند خالی باشد' })
  @Min(1, { message: 'مبلغ باید بیشتر از صفر باشد' })
  @IsNumber({}, { message: 'مبلغ وارد شده باید عدد باشد' })
  amount!: number;

  @IsEnum(PaymentType, {
    message: 'نوع پرداخت معتبر نیست',
  })
  payment_type!: PaymentType;
}

export class SellGoldDto {
  @IsNotEmpty({ message: 'مبلغ نمیتواند خالی باشد' })
  @Min(1, { message: 'مبلغ باید بیشتر از صفر باشد' })
  @IsNumber({}, { message: 'مبلغ وارد شده باید عدد باشد' })
  gold_amount!: number;
}
