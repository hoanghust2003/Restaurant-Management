import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { DishIngredientDto } from './dish-ingredient.dto';

export class CreateDishDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsString()
  description: string;
  
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
  
  @IsOptional()
  @IsString()
  image_url?: string;
  
  @IsOptional()
  @IsBoolean()
  is_preparable?: boolean;
  
  @IsOptional()
  @IsBoolean()
  available?: boolean;
  
  @IsNumber()
  @Min(0)
  preparation_time: number;
  
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DishIngredientDto)
  ingredients?: DishIngredientDto[];
}
