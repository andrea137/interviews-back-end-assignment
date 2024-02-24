import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderDto, OrderItem } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async addOrder1(dto: OrderDto) {
    const { userId, items, paymentMethod } = dto;

    try {
      await this.checkItems(items);
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
      // Here I must update the product available quantity and revert everything if any product is not available in enough quantity
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

  async addOrder(dto: OrderDto) {
    const { userId, items, paymentMethod } = dto;

    try {
      // TODO: it would be safer to add constraints and trigger directly in the db instead of the following check, prisma do not support this
      await this.checkItems(items);

      await this.prisma.$transaction(async () => {
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

        await this.prisma.orderItem.createMany({
          data: itemsWithOrderId,
        });

        for (const item of items) {
          await this.prisma.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Order already present.');
        } else if (error.code === 'P2003') {
          throw new ForbiddenException('Foreign key violation.');
        }
      }
      throw error;
    }
  }

  async checkItems(items: OrderItem[]) {
    if (!items || items.length === 0) {
      throw new Error('Cannot place order without items');
    }

    // get all product in a single query
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: items.map((item) => item.productId),
        },
      },
    });

    // compare the quantity with the availability
    items.forEach((item) => {
      const foundProduct = products.find(
        (product) => product.id === item.productId,
      );

      if (!foundProduct || foundProduct.quantity < item.quantity) {
        throw new Error(
          `Product with id ${item.productId} has only ${foundProduct?.quantity} items left`,
        );
      }
    });
  }
}
