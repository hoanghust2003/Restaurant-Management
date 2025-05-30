/**
 * Đối tượng đại diện cho nguyên liệu
 */
export interface IngredientModel {
  id: string;
  name: string;
  unit: string;
  threshold: number;
  image_url?: string | null;
  created_at?: Date;
  deleted_at?: Date | null;
  current_quantity?: number;
}

/**
 * DTO để tạo mới nguyên liệu
 */
export interface CreateIngredientDto {
  name: string;
  unit: string;
  threshold: number;
  image_url?: string;
}

/**
 * DTO để cập nhật nguyên liệu
 */
export interface UpdateIngredientDto {
  name?: string;
  unit?: string;
  threshold?: number;
  image_url?: string;
}
