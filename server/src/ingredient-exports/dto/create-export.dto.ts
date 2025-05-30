import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { CreateExportItemDto } from './create-export-item.dto';

export class CreateExportDto {
  @IsNotEmpty({ message: 'Lý do không được để trống' })
  @IsString({ message: 'Lý do phải là chuỗi' })
  reason: string;

  @IsArray({ message: 'Danh sách các nguyên liệu phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => CreateExportItemDto)
  items: CreateExportItemDto[];
}
