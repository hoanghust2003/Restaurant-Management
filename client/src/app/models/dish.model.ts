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
  description?: string;
  price: number;
  image_url?: string; // URL to dish image
  category?: string | CategoryModel;  // Can be either a category name string or a CategoryModel object
  categoryId?: string;  // Category ID
  created_at: Date;
  updated_at: Date;
  preparation_time?: number; // Time in minutes to prepare the dish
  available?: boolean; // Whether the dish is available
  is_preparable?: boolean; // Whether the dish needs preparation
  dishIngredients?: DishIngredientModel[]; // List of ingredients used in the dish
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
