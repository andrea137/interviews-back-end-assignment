import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [HttpModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
