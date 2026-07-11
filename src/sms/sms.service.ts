import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

interface sendOTP {
  phone: string;
  code: string;
}

@Injectable()
export class SmsService {
  constructor(private readonly httpService: HttpService) {}

  async sendOTPsms({ phone, code }: sendOTP) {
    try {
      const response = await firstValueFrom<AxiosResponse<unknown>>(
        this.httpService.post(
          process.env.SMS_SEND_URL!,
          {
            mobile: phone,
            templateId: process.env.SMS_SEND_TEMPlATE_ID,
            parameters: [
              {
                name: 'Code',
                value: code,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'text/plain',
              'x-api-key': process.env.SMS_SEND_TOKEN,
            },
          },
        ),
      );
      // console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw new HttpException('مشکلی رخ داده است', 500);
    }
  }
}
