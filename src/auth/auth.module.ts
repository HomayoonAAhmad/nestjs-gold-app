import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [SmsModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
