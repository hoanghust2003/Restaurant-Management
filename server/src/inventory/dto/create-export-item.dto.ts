import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';

export class CreateExportItemDto {
  @IsNotEmpty({ message: 'ID lô hàng không được để trống' })
  @IsUUID(undefined, { message: 'ID lô hàng không hợp lệ' })
  batchId: string;

  @IsNotEmpty({ message: 'ID nguyên liệu không được để trống' })
  @IsUUID(undefined, { message: 'ID nguyên liệu không hợp lệ' })
  ingredientId: string;

  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0.001, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;
}
