import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { MenuItemCategory } from '../entities/menu-item.entity';

export class CreateMenuItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsEnum(MenuItemCategory)
  category: MenuItemCategory;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationTimeMinutes?: number;

  @IsOptional()
  isAvailable?: boolean = true;
}