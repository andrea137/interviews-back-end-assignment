import { Module } from '@nestjs/common';
import { MockpaymentService } from './mockpayment.service';
import { MockpaymentController } from './mockpayment.controller';

@Module({
  controllers: [MockpaymentController],
  providers: [MockpaymentService]
})
export class MockpaymentModule {}
