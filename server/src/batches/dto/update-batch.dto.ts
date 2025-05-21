import { PartialType } from '@nestjs/mapped-types';
import { CreateBatchDto } from './create-batch.dto';
import { IsOptional, IsNumber, IsPositive, IsDateString, IsString } from 'class-validator';

export class UpdateBatchDto extends PartialType(CreateBatchDto) {
  @IsOptional()
  @IsString({ message: 'Tên lô phải là chuỗi' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Số lượng còn lại phải là số' })
  @IsPositive({ message: 'Số lượng còn lại phải là số dương' })
  remaining_quantity?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày hết hạn không hợp lệ' })
  expiry_date?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Giá phải là số' })
  @IsPositive({ message: 'Giá phải là số dương' })
  price?: number;
}
