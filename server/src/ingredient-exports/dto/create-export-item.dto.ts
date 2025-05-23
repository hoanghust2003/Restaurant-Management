import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';

export class CreateExportItemDto {
  @IsNotEmpty({ message: 'ID nguyên liệu không được để trống' })
  @IsUUID(undefined, { message: 'ID nguyên liệu không hợp lệ' })
  ingredient_id: string;

  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng không được âm' })
  quantity: number;
}
