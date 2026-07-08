import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
// import { generateOtp } from 'src/common/utils/helper';

interface requestBody {
  phone: string;
  code: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendOtp({ phone }: { phone: requestBody['phone'] }) {
    if (!phone) throw new BadRequestException('شماره تماس ارسال نشده');
    const otp = '123456';
    // const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await this.prismaService.otp.create({
      data: {
        phone,
        code: otp,
        expiresAt,
      },
    });

    return {
      code: 200,
      message: 'کد با موفقیت ارسال شد',
      expiresDate: expiresAt,
    };
  }

  async verifyOtp({ code, phone }: requestBody) {
    const otp = await this.prismaService.otp.findFirst({
      where: {
        phone: phone,
        code: code,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) throw new ForbiddenException('کد وارد شده اشتباه است');

    if (otp.expiresAt < new Date())
      throw new ForbiddenException('کد وارد شده منقضی شده است');

    await this.prismaService.otp.deleteMany({
      where: {
        phone,
      },
    });

    let user = await this.prismaService.user.findUnique({
      where: { phone: phone },
    });

    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          phone: phone,
          wallet: {
            create: {},
          },
        },
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

    return {
      code: 200,
      message: 'عملیات ورود با موفقیت انجام شد',
      token,
      user,
    };
  }
}
