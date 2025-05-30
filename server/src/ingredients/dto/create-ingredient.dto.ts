import { IsNotEmpty, IsString, IsNumber, Min, MaxLength, IsOptional } from 'class-validator';

export class CreateIngredientDto {
  @IsNotEmpty({ message: 'Tên nguyên liệu không được để trống' })
  @IsString({ message: 'Tên nguyên liệu phải là chuỗi' })
  @MaxLength(255, { message: 'Tên nguyên liệu không được vượt quá 255 ký tự' })
  name: string;

  @IsNotEmpty({ message: 'Đơn vị tính không được để trống' })
  @IsString({ message: 'Đơn vị tính phải là chuỗi' })
  @MaxLength(50, { message: 'Đơn vị tính không được vượt quá 50 ký tự' })
  unit: string;

  @IsNotEmpty({ message: 'Ngưỡng cảnh báo không được để trống' })
  @IsNumber({}, { message: 'Ngưỡng cảnh báo phải là số' })
  @Min(0, { message: 'Ngưỡng cảnh báo không được nhỏ hơn 0' })
  threshold: number;
  
  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh phải là chuỗi' })
  @MaxLength(255, { message: 'Đường dẫn ảnh không được vượt quá 255 ký tự' })
  image_url?: string;
}
