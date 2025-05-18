import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { DishIngredientDto } from './dish-ingredient.dto';

export class UpdateDishDto {
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
  
  @IsOptional()
  @IsString()
  image_url?: string;
  
  @IsOptional()
  @IsBoolean()
  is_preparable?: boolean;
  
  @IsOptional()
  @IsBoolean()
  available?: boolean;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  preparation_time?: number;
  
  @IsOptional()
  @IsUUID()
  categoryId?: string;
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DishIngredientDto)
  ingredients?: DishIngredientDto[];
}
