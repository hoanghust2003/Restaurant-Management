export interface CategoryModel {
  id: string;
  name: string;
  description: string;
  deleted_at?: Date | null;
}

/**
 * DTO để tạo mới danh mục
 */
export interface CreateCategoryDto {
  name: string;
  description?: string;
}

/**
 * DTO để cập nhật danh mục
 */
export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}
