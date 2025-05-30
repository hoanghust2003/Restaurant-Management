import { PartialType } from '@nestjs/mapped-types';
import { CreateBatchDto } from './create-batch.dto';
import { IsOptional, IsNumber, IsPositive, IsDateString, IsString, IsEnum } from 'class-validator';
import { BatchStatus } from '../../enums/batch-status.enum';

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
  @IsNumber({}, { message: 'Đơn giá phải là số' })
  @IsPositive({ message: 'Đơn giá phải là số dương' })
  unit_price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Tổng giá phải là số' })
  @IsPositive({ message: 'Tổng giá phải là số dương' })
  total_price?: number;

  @IsOptional()
  @IsString({ message: 'Số lô phải là chuỗi' })
  lot_number?: string;

  @IsOptional()
  @IsEnum(BatchStatus, { message: 'Trạng thái không hợp lệ' })
  status?: BatchStatus;
}
