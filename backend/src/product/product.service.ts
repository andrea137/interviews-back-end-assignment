import { ForbiddenException, Injectable } from '@nestjs/common';
import { ProductDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async addProduct(dto: ProductDto) {
    try {
      const product = await this.prisma.product.create({
        data: {
          ...dto,
        },
      });

      return product;
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

  async findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id: id } });
  }


  async fetchProductsCursorPagination(params: {
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput | null;
    categoryId?: number;
    productName?: string;
    serialNo?: string;
  }): Promise<Product[]> {
    const { take, cursor, categoryId, productName, serialNo } = params;
    const options: Prisma.ProductFindManyArgs = {
      skip: 0,
    };

    if (!isNaN(take) && take !== undefined) {
      options.take = take;
    }

    if (cursor && cursor.id) {
      options.cursor = cursor;
      options.skip = 1;
    }

    if (!isNaN(categoryId) && categoryId !== undefined) {
      options.where = {
        categoryId: categoryId,
      };
    }

    if (productName !== undefined) {
      options.where = {
        ...options.where,
        name: {
          contains: productName,
        },
      };
    }
    if (serialNo !== undefined) {
      options.where = {
        ...options.where,
        serialNo: {
          contains: serialNo,
        },
      };
    }

    return this.prisma.product.findMany(options);
  }
}
