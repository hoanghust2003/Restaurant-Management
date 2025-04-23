import { IsDate, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateIngredientDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  current_quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  threshold?: number;

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