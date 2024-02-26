import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/caegory.module';
import { OrderModule } from './order/order.module';
import { MockpaymentModule } from './mockpayment/mockpayment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductModule,
    UserModule,
    CategoryModule,
    PrismaModule,
    OrderModule,
    MockpaymentModule,
  ],
})
export class AppModule {}
