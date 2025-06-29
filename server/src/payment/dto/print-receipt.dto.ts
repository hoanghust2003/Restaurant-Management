import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrintReceiptDto {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Payment ID',
    example: '987fcdeb-51a2-43d1-b789-123456789abc',
  })
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @ApiProperty({
    description: 'Name of the person who printed the receipt',
    example: 'Nguyễn Văn A',
  })
  @IsNotEmpty()
  @IsString()
  printedBy: string;

  @ApiProperty({
    description: 'Date and time when receipt was printed',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  printedAt: Date;
}
