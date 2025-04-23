import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddDishToMenuDto {
  @IsNotEmpty()
  @IsUUID()
  dishId: string;
}