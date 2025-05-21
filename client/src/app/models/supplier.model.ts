/**
 * Đối tượng đại diện cho nhà cung cấp
 */
export interface SupplierModel {
  id: string;
  name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  created_at?: Date;
  deleted_at?: Date | null;
}

/**
 * DTO để tạo mới nhà cung cấp
 */
export interface CreateSupplierDto {
  name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  address: string;
}

/**
 * DTO để cập nhật nhà cung cấp
 */
export interface UpdateSupplierDto {
  name?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
}
