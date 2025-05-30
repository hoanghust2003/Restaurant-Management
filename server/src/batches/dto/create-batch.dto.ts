import { IsNotEmpty, IsString, IsUUID, IsNumber, IsPositive, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { BatchStatus } from '../../enums/batch-status.enum';

export class CreateBatchDto {
  @IsNotEmpty({ message: 'ID nhập kho không được để trống' })
  @IsUUID(4, { message: 'ID nhập kho không hợp lệ' })
  importId: string;

  @IsNotEmpty({ message: 'ID nguyên liệu không được để trống' })
  @IsUUID(4, { message: 'ID nguyên liệu không hợp lệ' })
  ingredientId: string;

  @IsNotEmpty({ message: 'Tên lô không được để trống' })
  @IsString({ message: 'Tên lô phải là chuỗi' })
  name: string;

  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @IsPositive({ message: 'Số lượng phải là số dương' })
  quantity: number;

  @IsNotEmpty({ message: 'Số lượng còn lại không được để trống' })
  @IsNumber({}, { message: 'Số lượng còn lại phải là số' })
  @IsPositive({ message: 'Số lượng còn lại phải là số dương' })
  remaining_quantity: number;

  @IsNotEmpty({ message: 'Ngày hết hạn không được để trống' })
  @IsDateString({}, { message: 'Ngày hết hạn không hợp lệ' })
  expiry_date: string;
  @IsNotEmpty({ message: 'Đơn giá không được để trống' })
  @IsNumber({}, { message: 'Đơn giá phải là số' })
  @IsPositive({ message: 'Đơn giá phải là số dương' })
  unit_price: number;

  @IsNumber({}, { message: 'Tổng giá phải là số' })
  @IsPositive({ message: 'Tổng giá phải là số dương' })
  total_price: number;

  @IsString({ message: 'Số lô phải là chuỗi' })
  @IsOptional()
  lot_number?: string;

  @IsEnum(BatchStatus, { message: 'Trạng thái không hợp lệ' })
  @IsOptional()
  status?: BatchStatus;
}
