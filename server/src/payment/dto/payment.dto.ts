import { ApiProperty } from '@nestjs/swagger';

export class PaymentStatusDto {
  @ApiProperty()
  orderId: string;
  
  @ApiProperty()
  status: string;
  
  @ApiProperty()
  message: string;
  
  @ApiProperty()
  amount?: number;
  
  @ApiProperty()
  transactionId?: string;
}

export class CreatePaymentDto {
  @ApiProperty()
  orderId: string;
  
  @ApiProperty()
  clientIp: string;
}
