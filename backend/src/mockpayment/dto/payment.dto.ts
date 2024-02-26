import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentReqDto {
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

  @ApiProperty({ description: 'The amount', example: '100.00' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export enum Status {
  Approved = 'approved',
  Declined = 'declined',
  Error = 'error',
}

export class PaymentResponseDto {
  @ApiProperty({ example: 'tx_123456789', description: 'The transaction ID' })
  @IsString()
  transactionId: string;

  @ApiProperty({
    example: 'approved',
    enum: Status,
    description: 'The status of the transaction',
  })
  @IsEnum(Status)
  status: Status;
}
