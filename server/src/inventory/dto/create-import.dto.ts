import { IsNotEmpty, IsString, IsUUID, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBatchDto } from './create-batch.dto';

export class CreateImportDto {
  @IsNotEmpty({ message: 'ID nhà cung cấp không được để trống' })
  @IsUUID(undefined, { message: 'ID nhà cung cấp không hợp lệ' })
  supplierId: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;

  @IsArray({ message: 'Danh sách lô hàng phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => CreateBatchDto)
  batches: CreateBatchDto[];
}
