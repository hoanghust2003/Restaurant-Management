import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExportItemDto } from './create-export-item.dto';

export enum ExportReason {
  USAGE = 'usage',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  OTHER = 'other',
}

export class CreateExportDto {
  @IsOptional()
  @IsString({ message: 'Mã phiếu xuất phải là chuỗi' })
  reference_number?: string;

  @IsNotEmpty({ message: 'Ngày xuất không được để trống' })
  @IsDate({ message: 'Ngày xuất không hợp lệ' })
  @Type(() => Date)
  export_date: Date;

  @IsNotEmpty({ message: 'Lý do xuất không được để trống' })
  @IsEnum(ExportReason, { message: 'Lý do xuất không hợp lệ' })
  reason: ExportReason;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  description?: string;

  @IsArray({ message: 'Danh sách xuất kho không hợp lệ' })
  @ValidateNested({ each: true })
  @Type(() => CreateExportItemDto)
  items: CreateExportItemDto[];
}
