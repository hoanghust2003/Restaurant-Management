import { IsNotEmpty, IsString, IsEmail, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống' })
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi' })
  @MaxLength(255, { message: 'Tên nhà cung cấp không được vượt quá 255 ký tự' })
  name: string;

  @IsNotEmpty({ message: 'Tên người liên hệ không được để trống' })
  @IsString({ message: 'Tên người liên hệ phải là chuỗi' })
  @MaxLength(255, { message: 'Tên người liên hệ không được vượt quá 255 ký tự' })
  contact_name: string;

  @IsNotEmpty({ message: 'Số điện thoại người liên hệ không được để trống' })
  @IsString({ message: 'Số điện thoại người liên hệ phải là chuỗi' })
  @MaxLength(20, { message: 'Số điện thoại người liên hệ không được vượt quá 20 ký tự' })
  contact_phone: string;

  @IsNotEmpty({ message: 'Email người liên hệ không được để trống' })
  @IsEmail({}, { message: 'Email người liên hệ không hợp lệ' })
  @MaxLength(255, { message: 'Email người liên hệ không được vượt quá 255 ký tự' })
  contact_email: string;

  @IsNotEmpty({ message: 'Địa chỉ nhà cung cấp không được để trống' })
  @IsString({ message: 'Địa chỉ nhà cung cấp phải là chuỗi' })
  address: string;
}
