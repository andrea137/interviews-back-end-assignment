import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { OrderDto } from './dto';

@ApiTags('product')
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('addorder')
  @ApiOperation({ summary: 'Add a new order' })
  @ApiBody({ type: OrderDto })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
  })
  @ApiResponse({
    status: 403,
    description: 'The order has not been created.',
  })
  async addOrder(@Body() dto: OrderDto) {
    return this.orderService.addOrder(dto);
  }
}
