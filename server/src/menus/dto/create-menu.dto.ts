import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
  
  @IsString()
  @IsOptional()
  image_url?: string;

  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  dishIds?: string[];
}
