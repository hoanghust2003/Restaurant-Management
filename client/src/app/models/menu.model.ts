// models/menu.model.ts
import { DishModel } from './dish.model';

/**
 * Represents a Menu in the system
 */
export interface MenuModel {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  createdAt?: Date;
  dishes?: DishModel[]; // Optional list of dishes in the menu
  is_main?: boolean; // Optional flag to indicate if this is the main menu
}

/**
 * Data transfer object for creating a new menu
 */
export interface CreateMenuDto {
  name: string;
  description: string;
  image_url?: string;
  dishIds?: string[]; // Optional list of dish IDs to add to the menu
  is_main?: boolean; // Optional flag to indicate if this should be the main menu
}

/**
 * Data transfer object for updating an existing menu
 */
export interface UpdateMenuDto {
  name?: string;
  description?: string;
  image_url?: string;
  dishIds?: string[]; // Optional list of dish IDs to update in the menu
  is_main?: boolean; // Optional flag to update the main menu status
}

/**
 * Represents a relation between a menu and a dish
 */
export interface MenuDishModel {
  id: string;
  menuId: string;
  dishId: string;
  dish?: DishModel; // Optional dish details
}
