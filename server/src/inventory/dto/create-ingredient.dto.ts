import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIngredientDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  name: string;

  @IsNotEmpty()
  @IsUUID()
  unitId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  current_quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  threshold: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiry_date?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  supplier?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  batch_code?: string;
}