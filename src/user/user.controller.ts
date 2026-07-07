import { Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getUserData(@Req() req: Request) {
    const id = req.user.id;
    return this.userService.getUserData(id);
  }

  @Put('update')
  updateUserData(@Req() req: Request) {
    const id = req.user.id;
    return this.userService.updateUserData(id);
  }

  @Get('assets')
  getUserAssets(@Req() req: Request) {
    const userId = req.user.id;
    return this.userService.getUserAssets(userId);
  }
}
