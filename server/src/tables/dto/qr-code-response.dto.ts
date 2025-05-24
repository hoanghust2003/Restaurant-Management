import { ApiProperty } from '@nestjs/swagger';

export class QrCodeResponseDto {
  @ApiProperty({
    description: 'The QR code as base64 encoded string',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
  })
  qrCode: string;

  @ApiProperty({
    description: 'The URL that the QR code points to',
    example: 'http://localhost:3000/customer/menu?tableId=123e4567-e89b-12d3-a456-426614174000'
  })
  url: string;

  @ApiProperty({
    description: 'Table information',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Bàn 1',
      capacity: 4
    }
  })  table: {
    id: string;
    name: string;
    capacity: number;
  };
}