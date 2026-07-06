import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'شماره تماس نمیتواند خالی باشد' })
  @Matches(/^09\d{9}$/, {
    message: 'شماره موبایل معتبر نیست',
  })
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'شماره تماس نمیتواند خالی باشد' })
  @Matches(/^09\d{9}$/, {
    message: 'شماره موبایل معتبر نیست',
  })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: 'کد وارد شده نمیتواند خالی باشد' })
  @Matches(/^\d{1,6}$/, {
    message: 'کد باید حداکثر ۶ رقم باشد',
  })
  code!: string;
}
