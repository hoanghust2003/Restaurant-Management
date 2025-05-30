import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class PrintReceiptDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @IsNotEmpty()
  @IsString()
  printedBy: string;

  @IsDateString()
  printedAt: Date;
}
