import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async addOrder(dto: OrderDto) {
    const { userId, items, paymentMethod } = dto;
    if (!items || items.length === 0) {
      throw new Error('Cannot place order without items');
    }
    try {
      const order = await this.prisma.order.create({
        data: {
          userId,
        },
      });
      let itemsWithOrderId = items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
      }));
      let res = await this.prisma.orderItem.createMany({
        data: itemsWithOrderId,
      });
      if (res.count !== itemsWithOrderId.length) {
        throw new Error('Failed to create some OrderItems');
      }
      return order;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Product already present.');
        } else if (error.code === 'P2003') {
          throw new ForbiddenException('Foreign key violation.');
        }
      }
      throw error;
    }
  }
}
