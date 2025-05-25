import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  phone: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  cover_image_url?: string;
}
