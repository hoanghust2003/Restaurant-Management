import { IsNotEmpty, IsString, IsUUID, IsNumber, IsDate, Min, IsISO8601 } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBatchDto {
  @IsNotEmpty({ message: 'ID nguyên liệu không được để trống' })
  @IsUUID(undefined, { message: 'ID nguyên liệu không hợp lệ' })
  ingredientId: string;

  @IsNotEmpty({ message: 'Tên lô hàng không được để trống' })
  @IsString({ message: 'Tên lô hàng phải là chuỗi' })
  name: string;

  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng không được âm' })
  quantity: number;

  @IsNotEmpty({ message: 'Ngày hết hạn không được để trống' })
  @IsISO8601({}, { message: 'Ngày hết hạn không hợp lệ' })
  expiry_date: string;
  
  @IsNotEmpty({ message: 'Giá không được để trống' })
  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá không được âm' })
  price: number;
}
