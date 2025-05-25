/**
 * Restaurant model represents restaurant information
 */
export interface RestaurantModel {
  id: string;
  name: string;
  address: string;
  phone: string;
  logo_url?: string;
  cover_image_url?: string;
  created_at: Date;
}

/**
 * DTO for creating a new restaurant
 */
export interface CreateRestaurantDto {
  name: string;
  address: string;
  phone: string;
  logo_url?: string;
  cover_image_url?: string;
}

/**
 * DTO for updating an existing restaurant
 */
export interface UpdateRestaurantDto {
  name?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  cover_image_url?: string;
}
