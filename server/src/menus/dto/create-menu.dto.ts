import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({
    description: 'Menu name',
    example: 'Thực đơn chính',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Menu description',
    example: 'Thực đơn các món ăn chính của nhà hàng',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiProperty({
    description: 'Menu image URL',
    example: 'https://example.com/menu-image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({
    description: 'Array of dish IDs to include in this menu',
    example: ['123e4567-e89b-12d3-a456-426614174000', '987fcdeb-51a2-43d1-b789-123456789abc'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  dishIds?: string[];

  @ApiProperty({
    description: 'Whether this is the main menu',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_main?: boolean;
}
