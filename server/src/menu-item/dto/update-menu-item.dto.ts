import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { MenuItemCategory } from '../entities/menu-item.entity';

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsEnum(MenuItemCategory)
  category?: MenuItemCategory;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationTimeMinutes?: number;
}