import { CategoryModel } from './category.model';

export interface DishIngredientModel {
  id: string;
  ingredientId: string;
  dishId: string;
  quantity: number;
  ingredient?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface DishModel {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_preparable: boolean;
  available: boolean;
  preparation_time: number;
  categoryId: string;
  category?: CategoryModel;
  dishIngredients?: DishIngredientModel[];
  created_at: Date;
  deleted_at?: Date | null;
}

/**
 * DTO để tạo mới món ăn
 */
export interface CreateDishDto {
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_preparable?: boolean;
  available?: boolean;
  preparation_time: number;
  categoryId: string;
  ingredients?: {
    ingredientId: string;
    quantity: number;
  }[];
}

/**
 * DTO để cập nhật món ăn
 */
export interface UpdateDishDto {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  is_preparable?: boolean;
  available?: boolean;
  preparation_time?: number;
  categoryId?: string;
  ingredients?: {
    ingredientId: string;
    quantity: number;
  }[];
}
