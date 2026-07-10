import { IsNumberString, IsString, Length } from 'class-validator';

export class createCardDto {
  @IsNumberString(
    {
      no_symbols: true,
    },
    {
      message: 'شماره شبا باید فقط شامل عدد باشد',
    },
  )
  @Length(24, 24, {
    message: 'شماره شبا باید ۲۴ رقم باشد.',
  })
  shaba!: string;

  @IsNumberString(
    {
      no_symbols: true,
    },
    {
      message: 'شماره کارت باید فقط شامل عدد باشد',
    },
  )
  @Length(16, 16, {
    message: 'شماره کارت باید ۱۶ رقم باشد.',
  })
  card_number!: string;

  @IsString({
    message: 'نام بانک باید رشته باشد',
  })
  bank_name!: string;
}
