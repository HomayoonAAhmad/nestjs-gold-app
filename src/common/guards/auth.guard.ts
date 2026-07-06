import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

interface JwtPayload {
  id: number;
}

interface AuthRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = request.headers?.authorization?.split('Bearer ')[1];

    if (!token) throw new UnauthorizedException('توکن ارسال نشده');

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      request.user = payload;
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('توکن معتبر نیست');
    }
  }
}
