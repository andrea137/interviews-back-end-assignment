import { Body, Controller, Post } from '@nestjs/common';
import { MockpaymentService } from './mockpayment.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentReqDto, PaymentResponseDto } from './dto';

@ApiTags('mockpayment')
@Controller('mockpayment')
export class MockpaymentController {
  constructor(private mockpaymentService: MockpaymentService) {}
  @Post('paymentRequest')
  @ApiOperation({ summary: 'Request a payment' })
  @ApiBody({ type: PaymentReqDto })
  @ApiResponse({
    status: 201,
    description: 'Payment processed succesfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request provided',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async paymentRequest(@Body() dto: PaymentReqDto) {
    return this.mockpaymentService.paymentRequest(dto);
  }
}
