import { IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class CreateTableDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(50)
  capacity: number;
}
