import { IsNotEmpty, IsNumber } from 'class-validator';

export class IncreaseWalletBalanceDto {
  @IsNumber({}, { message: 'مبلغ باید عدد باشد' })
  @IsNotEmpty({ message: 'مبلغ نباید خالی باشد' })
  amount!: number;
}
