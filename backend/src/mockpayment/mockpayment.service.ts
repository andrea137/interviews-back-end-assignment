import { Injectable } from '@nestjs/common';
import { PaymentReqDto, PaymentResponseDto, Status } from './dto';

@Injectable()
export class MockpaymentService {
  async paymentRequest(dto: PaymentReqDto): Promise<PaymentResponseDto> {
    // NOTE: just for basic tests
    const availablefunds = 1000;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const transactionId = generateTID(true);

    if (
      (Number(dto.expiryYear) > currentYear ||
      (Number(dto.expiryYear) === currentYear &&
        Number(dto.expiryMonth) > currentMonth) ) &&
        dto.amount <= availablefunds
    ) {
      return { transactionId: transactionId, status: Status.Approved };
    }

    return { transactionId: transactionId, status: Status.Declined };
  }
}
// NOTE: just for test. The function does not generates unique transitionID and this is not an actual seed
function generateTID(random?: boolean): string {
  let formattedNumber = '123456789';
  if (random === true) {
    // Generate a random number of 9 digits the random number generator.
    const randomNumber = Math.floor(Math.random() * 1e9);

    // Format the number to ensure it is always 9 digits long, padding with zeros at the start if necessary.
    formattedNumber = String(randomNumber).padStart(9, '0');
  }

  // Return the formatted string that starts with "tx_" followed by the 9-digit (random) number.
  return `tx_${formattedNumber}`;
}
