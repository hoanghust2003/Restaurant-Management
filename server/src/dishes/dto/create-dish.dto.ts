import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DishIngredientDto } from './dish-ingredient.dto';

export class CreateDishDto {
  @ApiProperty({
    description: 'Dish name',
    example: 'Phở Bò Tái'
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @ApiProperty({
    description: 'Dish description',
    example: 'Phở bò tái truyền thống với nước dùng đậm đà'
  })
  @IsString()
  description: string;
  
  @ApiProperty({
    description: 'Dish price in VND',
    example: 85000,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
  
  @ApiProperty({
    description: 'Image URL for the dish',
    example: 'https://example.com/images/pho-bo-tai.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  image_url?: string;
  
  @ApiProperty({
    description: 'Whether the dish can be prepared in kitchen',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  is_preparable?: boolean;
  
  @ApiProperty({
    description: 'Whether the dish is available for ordering',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
  
  @ApiProperty({
    description: 'Preparation time in minutes',
    example: 15,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  preparation_time: number;
  
  @ApiProperty({
    description: 'Category ID that this dish belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
  
  @ApiProperty({
    description: 'List of ingredients required for this dish',
    type: [DishIngredientDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DishIngredientDto)
  ingredients?: DishIngredientDto[];
}
