import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString, IsUrl, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

  @ApiProperty({ description: 'The payment methood' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}