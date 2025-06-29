import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Món chính',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  @MaxLength(100, { message: 'Tên danh mục không được vượt quá 100 ký tự' })
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Các món ăn chính trong thực đơn',
    required: false,
  })
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description: string;
}
