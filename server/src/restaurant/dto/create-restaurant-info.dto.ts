import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateRestaurantInfoDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  address: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  opening_hours: string;
}