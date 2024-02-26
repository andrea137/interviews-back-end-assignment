import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreditCard {
  @ApiProperty({
    description: 'The credit card number',
    example: '4111111111111111',
  })
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty({ description: 'The expiry month', example: '12' })
  @IsString()
  @IsNotEmpty()
  expiryMonth: string;

  @ApiProperty({ description: 'The expiry year', example: '2023' })
  @IsString()
  @IsNotEmpty()
  expiryYear: string;

  @ApiProperty({ description: 'The cvv', example: '123' })
  @IsString()
  @IsNotEmpty()
  cvv: string;
}

export class OrderItem {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: 'Number of products' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class OrderDto {
  @ApiProperty({ description: 'The user (id) placing the order' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'The items of the order', type: [OrderItem] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  items: OrderItem[];

  @ApiProperty({ description: 'The credit card data' })
  @Type(() => CreditCard)
  @IsNotEmpty()
  creditCard: CreditCard;
}
