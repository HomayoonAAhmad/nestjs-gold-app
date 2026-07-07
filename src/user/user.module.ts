import { Module } from '@nestjs/common';
import { GoldModule } from 'src/gold/gold.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [GoldModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
