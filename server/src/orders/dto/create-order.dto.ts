import { IsArray, IsNotEmpty, IsString, IsOptional, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ description: 'Dish ID', example: 'uuid-string' })
  @IsNotEmpty()
  @IsString()
  dishId: string;

  @ApiProperty({ description: 'Quantity', example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Special notes for this dish', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Table ID', example: 'uuid-string' })
  @IsNotEmpty()
  @IsString()
  tableId: string;

  @ApiProperty({ description: 'User ID (server/waiter)', example: 'uuid-string' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ 
    description: 'Order items',
    type: [OrderItemDto],
    example: [{ dishId: 'uuid-string', quantity: 2, note: 'No spicy' }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
