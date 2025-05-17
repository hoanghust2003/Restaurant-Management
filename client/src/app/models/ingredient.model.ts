/**
 * Đối tượng đại diện cho nguyên liệu
 */
export interface IngredientModel {
  id: string;
  name: string;
  unit: string;
  threshold: number;
  created_at?: Date;
  deleted_at?: Date | null;
}

/**
 * DTO để tạo mới nguyên liệu
 */
export interface CreateIngredientDto {
  name: string;
  unit: string;
  threshold: number;
}

/**
 * DTO để cập nhật nguyên liệu
 */
export interface UpdateIngredientDto {
  name?: string;
  unit?: string;
  threshold?: number;
}
