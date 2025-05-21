import { IsArray, IsString, IsOptional, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

class UpdateOrderItemDto {
  @ApiProperty({ description: 'Item ID', example: 'uuid-string', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Dish ID', example: 'uuid-string' })
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

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({ 
    description: 'Order items to add or update',
    type: [UpdateOrderItemDto],
    required: false,
    example: [{ id: 'uuid-string', dishId: 'uuid-string', quantity: 3, note: 'Extra sauce' }]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];

  @ApiProperty({ 
    description: 'Item IDs to remove from the order',
    type: [String],
    required: false,
    example: ['uuid-string']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removedItems?: string[];
}
