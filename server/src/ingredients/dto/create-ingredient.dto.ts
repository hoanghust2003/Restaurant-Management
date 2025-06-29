import { IsNotEmpty, IsString, IsNumber, Min, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIngredientDto {
  @ApiProperty({
    description: 'Ingredient name',
    example: 'Thịt bò',
    maxLength: 255
  })
  @IsNotEmpty({ message: 'Tên nguyên liệu không được để trống' })
  @IsString({ message: 'Tên nguyên liệu phải là chuỗi' })
  @MaxLength(255, { message: 'Tên nguyên liệu không được vượt quá 255 ký tự' })
  name: string;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'kg',
    maxLength: 50
  })
  @IsNotEmpty({ message: 'Đơn vị tính không được để trống' })
  @IsString({ message: 'Đơn vị tính phải là chuỗi' })
  @MaxLength(50, { message: 'Đơn vị tính không được vượt quá 50 ký tự' })
  unit: string;

  @ApiProperty({
    description: 'Low stock warning threshold',
    example: 10,
    minimum: 0
  })
  @IsNotEmpty({ message: 'Ngưỡng cảnh báo không được để trống' })
  @IsNumber({}, { message: 'Ngưỡng cảnh báo phải là số' })
  @Min(0, { message: 'Ngưỡng cảnh báo không được nhỏ hơn 0' })
  threshold: number;
  
  @ApiProperty({
    description: 'Image URL for the ingredient',
    example: 'https://example.com/images/beef.jpg',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh phải là chuỗi' })
  @MaxLength(255, { message: 'Đường dẫn ảnh không được vượt quá 255 ký tự' })
  image_url?: string;
}
