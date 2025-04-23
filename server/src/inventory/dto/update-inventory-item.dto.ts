import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { ItemCategory } from '../entities/item-category.enum';

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @IsOptional()
  @IsDate()
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  locationInStorage?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}