import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { CreateBatchDto } from './create-batch.dto';

export class CreateImportDto {
  @IsNotEmpty({ message: 'ID nhà cung cấp không được để trống' })
  @IsUUID(undefined, { message: 'ID nhà cung cấp không hợp lệ' })
  supplier_id: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;

  @IsArray({ message: 'Danh sách các lô hàng phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => CreateBatchDto)
  batches: CreateBatchDto[];
}
