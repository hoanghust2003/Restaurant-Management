import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class DishIngredientDto {
  @IsNotEmpty()
  @IsUUID()
  ingredientId: string;
  
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}
