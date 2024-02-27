import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderDto, OrderItem } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { PaymentReqDto, Status } from '../mockpayment/dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  async addOrder(dto: OrderDto) {
    const { userId, items, creditCard } = dto;

    try {
      // TODO: it would be safer to add constraints and trigger directly in the db to check the product availability.
      // Here it is checked while calculating the price.
      const totalPrice = await this.computeTotalPrice(items);

      //  Check the balance
      // TODO: here we should use a real system
      const endpt = this.config.get('PAYMENT_SERVICE_ENDPOINT');
      const req: PaymentReqDto = { ...creditCard, amount: totalPrice };
      const response$ = this.httpService.post(endpt, req);
      const response = await lastValueFrom(response$);

      if (response.data.status !== Status.Approved) {
        throw new ForbiddenException(`Transaction ${response.data.status}.`);
      }

      await this.prisma.$transaction(async () => {
        const order = await this.prisma.order.create({
          data: {
            userId,
            transactionId: response.data.transactionId,
            totalPrice,
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

  //   async checkItems(items: OrderItem[]) {
  //     if (!items || items.length === 0) {
  //       throw new Error('Cannot place order without items');
  //     }

  //     // get all product in a single query
  //     const products = await this.prisma.product.findMany({
  //       where: {
  //         id: {
  //           in: items.map((item) => item.productId),
  //         },
  //       },
  //     });

  //     // compare the quantity with the availability
  //     items.forEach((item) => {
  //       const foundProduct = products.find(
  //         (product) => product.id === item.productId,
  //       );

  //       if (!foundProduct || foundProduct.quantity < item.quantity) {
  //         throw new Error(
  //           `Product with id ${item.productId} has only ${foundProduct?.quantity} items left`,
  //         );
  //       }
  //     });
  //   }

  async computeTotalPrice(items: OrderItem[]): Promise<number> {
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: items.map((item) => item.productId),
        },
      },
    });

    let totalPrice = 0;

    items.forEach((item) => {
      const foundProduct = products.find(
        (product) => product.id === item.productId,
      );

      if (!foundProduct) {
        throw new Error(`Product with id ${item.productId} not found.`);
      }

      if (foundProduct.quantity < item.quantity) {
        throw new Error(
          `Product with id ${item.productId} has only ${foundProduct.quantity} items left, but ${item.quantity} were requested.`,
        );
      }

      totalPrice += foundProduct.price * item.quantity;
    });

    return totalPrice;
  }

  // const total = await this.prisma.product.aggregate({
  //   _sum: {
  //     price: true,
  //   },
  //   where: {
  //     id: {
  //       in: items.map((item) => item.productId),
  //     },
  //   },
  // });

  //return total._sum.price;
}
