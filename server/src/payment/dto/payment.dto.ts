import { ApiProperty } from '@nestjs/swagger';

export class PaymentStatusDto {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  orderId: string;
  
  @ApiProperty({
    description: 'Payment status',
    example: 'success',
  })
  status: string;
  
  @ApiProperty({
    description: 'Payment message',
    example: 'Payment completed successfully',
  })
  message: string;
  
  @ApiProperty({
    description: 'Payment amount',
    example: 150000,
    required: false,
  })
  amount?: number;
  
  @ApiProperty({
    description: 'Transaction ID',
    example: 'TXN123456789',
    required: false,
  })
  transactionId?: string;
}

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Order ID to create payment for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  orderId: string;
  
  @ApiProperty({
    description: 'Client IP address',
    example: '192.168.1.1',
  })
  clientIp: string;
}
