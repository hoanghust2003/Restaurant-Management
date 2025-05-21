import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExportItemDto } from './create-export-item.dto';

export class CreateExportDto {
  @IsNotEmpty({ message: 'Lý do xuất kho không được để trống' })
  @IsString({ message: 'Lý do xuất kho phải là chuỗi' })
  reason: string;

  @IsArray({ message: 'Danh sách hàng xuất phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => CreateExportItemDto)
  items: CreateExportItemDto[];
}
