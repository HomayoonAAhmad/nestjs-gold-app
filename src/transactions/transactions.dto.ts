import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';
import { PaymentType, TransactionType } from 'generated/prisma/enums';

export class BuyGoldDto {
  @IsEnum(PaymentType, {
    message: 'نوع پرداخت معتبر نیست',
  })
  payment_type!: PaymentType;

  @IsNotEmpty({ message: 'مبلغ نمیتواند خالی باشد' })
  @ValidateIf(
    (o: { payment_type: PaymentType }) =>
      o.payment_type === PaymentType.gateway,
  )
  @Min(400_000, {
    message: 'حداقل مبلغ برای انتقال به درگاه ۴۰۰ هزار تومان است',
  })
  @IsNumber({}, { message: 'مبلغ وارد شده باید عدد باشد' })
  amount!: number;
}

export class SellGoldDto {
  @IsNotEmpty({ message: 'مبلغ نمیتواند خالی باشد' })
  @Min(1, { message: 'مبلغ باید بیشتر از صفر باشد' })
  @IsNumber({}, { message: 'مبلغ وارد شده باید عدد باشد' })
  gold_amount!: number;
}

export class getTransactionDto {
  @IsOptional()
  @IsEnum(TransactionType, {
    message: 'نوع تراکنش مورد نظر شما نامعتبر است',
  })
  type!: TransactionType;
}

export class WithdrawTransactionDto {
  @IsNotEmpty({ message: 'مبلغ نمیتواند خالی باشد' })
  @Min(400_000, {
    message: 'حداقل مبلغ برای ثبت درخواست برداشت ۴۰۰ هزار تومان است',
  })
  @IsNumber({}, { message: 'مبلغ وارد شده باید عدد باشد' })
  amount!: number;

  @IsNumber({}, { message: 'شناسه کارت وارد شده معتبر نیست' })
  card_id!: number;
}
