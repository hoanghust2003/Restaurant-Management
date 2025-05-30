import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  @MaxLength(100, { message: 'Tên danh mục không được vượt quá 100 ký tự' })
  name: string;

  @IsString({ message: 'Mô tả phải là chuỗi' })
  description: string;
}
