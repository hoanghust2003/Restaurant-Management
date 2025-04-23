import { IsNotEmpty, IsNumber, IsPositive, IsString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class MenuItemIngredientDto {
  @IsNotEmpty()
  @IsNumber()
  ingredientId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  unit: string;
}

export class CreateMenuItemIngredientsDto {
  @IsNotEmpty()
  @IsNumber()
  menuItemId: number;
  
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MenuItemIngredientDto)
  ingredients: MenuItemIngredientDto[];
}