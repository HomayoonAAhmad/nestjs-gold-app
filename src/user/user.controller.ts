import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  @Get()
  sendOtp(@Req() req: Request) {
    const id = req.user.id;
    return id;
  }
}
