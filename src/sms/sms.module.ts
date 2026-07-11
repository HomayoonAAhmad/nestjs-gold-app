import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [SmsService],
  exports: [SmsModule, SmsService],
})
export class SmsModule {}
