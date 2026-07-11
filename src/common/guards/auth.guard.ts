import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_SKIP_AUTH } from '../decorators/skipAuth.decorator';

interface JwtPayload {
  id: number;
}

interface AuthRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(IS_SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isSkipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = request.headers?.authorization?.split('Bearer ')[1];

    if (!token) throw new UnauthorizedException('توکن ارسال نشده!');

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
