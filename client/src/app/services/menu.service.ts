// services/menu.service.ts
import axios from '../utils/axios';
import { MenuModel, CreateMenuDto, UpdateMenuDto } from '../models/menu.model';
import { requestCache } from '../utils/requestCache';

// Define API endpoints
const API_URL = '/menus';

/**
 * Service for handling menu CRUD operations
 */
export const menuService = {
  /**
   * Get all menus
   * @param includeDeleted - Whether to include soft-deleted menus
   */
  async getAll(includeDeleted = false): Promise<MenuModel[]> {
    const cacheKey = `${API_URL}?includeDeleted=${includeDeleted}`;
    
    try {
      // Check cache first
      const cachedData = requestCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // If not in cache, fetch from API
      const params = includeDeleted ? { includeDeleted: 'true' } : {};
      const response = await axios.get(API_URL, { params });
      
      // Cache the result
      requestCache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw error;
    }
  },

  /**
   * Get a specific menu by ID
   * @param id - The menu ID
   * @param includeDeleted - Whether to include soft-deleted menus
   */
  async getById(id: string, includeDeleted = false): Promise<MenuModel> {
    const cacheKey = `${API_URL}/${id}?includeDeleted=${includeDeleted}`;
    
    try {
      // Check cache first
      const cachedData = requestCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // If not in cache, fetch from API
      const params = includeDeleted ? { includeDeleted: 'true' } : {};
      const response = await axios.get(`${API_URL}/${id}`, { params });
      
      // Cache the result
      requestCache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching menu ${id}:`, error);
      throw error;
    }
  },
  /**
   * Create a new menu
   * @param menu - The menu data to create
   */
  async create(menu: CreateMenuDto): Promise<MenuModel> {
    try {
      // Clone the data to avoid direct mutation
      const menuData = { ...menu };
      // Handle dishIds separately if present
      const dishIds = menuData.dishIds;
      delete menuData.dishIds;
      
      // Create the menu
      const response = await axios.post(API_URL, menuData);
      
      // If dishIds are provided, add them to the menu
      if (dishIds && dishIds.length > 0 && response.data && response.data.id) {
        try {
          await this.addDishes(response.data.id, dishIds);
          
          // Refetch the menu with dishes included
          const updatedMenu = await this.getById(response.data.id, true);
          
          // Invalidate cache for menu list
          requestCache.invalidateByPrefix(API_URL);
          
          return updatedMenu;
        } catch (dishError) {
          console.error('Error adding dishes to newly created menu:', dishError);
          // Still return the created menu even if adding dishes fails
          return response.data;
        }
      }
      
      // Invalidate cache for menu list
      requestCache.invalidateByPrefix(API_URL);
      
      return response.data;
    } catch (error) {
      console.error('Error creating menu:', error);
      throw error;
    }
  },
  /**
   * Update an existing menu
   * @param id - The menu ID to update
   * @param menu - The updated menu data
   */
  async update(id: string, menu: UpdateMenuDto): Promise<MenuModel> {
    try {
      // If updating main menu status, use dedicated endpoint
      if (menu.is_main !== undefined) {
        const response = await axios.patch(`${API_URL}/${id}/set-main`);
        requestCache.invalidateByPrefix(API_URL);
        return response.data;
      }

      // Regular update for other fields
      const response = await axios.patch(`${API_URL}/${id}`, menu);
      
      // Update dishes if provided
      const dishIds = menu.dishIds;
      if (dishIds !== undefined) {
        const currentMenu = await this.getById(id);
        const currentDishIds = currentMenu.dishes?.map(dish => dish.id) || [];
        
        // Calculate differences
        const dishesToRemove = currentDishIds.filter(dishId => !dishIds.includes(dishId));
        const dishesToAdd = dishIds.filter(dishId => !currentDishIds.includes(dishId));
        
        // Remove dishes that are no longer in the menu
        if (dishesToRemove.length > 0) {
          await this.removeDishes(id, dishesToRemove);
        }
        
        // Add new dishes to the menu
        if (dishesToAdd.length > 0) {
          await this.addDishes(id, dishesToAdd);
        }
      }
      
      // Invalidate cache
      requestCache.invalidate(`${API_URL}/${id}`);
      requestCache.invalidateByPrefix(API_URL);
      
      return response.data;
    } catch (error) {
      console.error(`Error updating menu ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a menu
   * @param id - The menu ID to delete
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`);
      
      // Invalidate cache for specific menu and menu list
      requestCache.invalidate(`${API_URL}/${id}`);
      requestCache.invalidateByPrefix(API_URL);
    } catch (error) {
      console.error(`Error deleting menu ${id}:`, error);
      throw error;
    }
  },

  /**
   * Restore a soft-deleted menu
   * @param id - The menu ID to restore
   */
  async restore(id: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/${id}/restore`);
      
      // Invalidate cache for specific menu and menu list
      requestCache.invalidate(`${API_URL}/${id}`);
      requestCache.invalidateByPrefix(API_URL);
    } catch (error) {
      console.error(`Error restoring menu ${id}:`, error);
      throw error;
    }
  },
  /**
   * Add dishes to a menu
   * @param menuId - The menu ID
   * @param dishIds - Array of dish IDs to add
   */
  async addDishes(menuId: string, dishIds: string[]): Promise<MenuModel> {
    try {
      // First get the current menu to return if the API call fails
      const currentMenu = await this.getById(menuId);
      
      try {
        const response = await axios.post(`${API_URL}/${menuId}/dishes`, { dishIds });
        
        // Invalidate cache for specific menu
        requestCache.invalidate(`${API_URL}/${menuId}`);
        requestCache.invalidateByPrefix(API_URL);
        
        // Refetch the menu with updated dishes
        return await this.getById(menuId, true);
      } catch (error) {
        console.error(`Error adding dishes to menu ${menuId}:`, error);
        // Return the current menu even if the API call fails
        return currentMenu;
      }
    } catch (error) {
      console.error(`Error fetching menu ${menuId} before adding dishes:`, error);
      throw error;
    }
  },
  /**
   * Remove dishes from a menu
   * @param menuId - The menu ID
   * @param dishIds - Array of dish IDs to remove
   */
  async removeDishes(menuId: string, dishIds: string[]): Promise<MenuModel> {
    try {
      // First get the current menu to return if the API call fails
      const currentMenu = await this.getById(menuId);
      
      try {
        const response = await axios.delete(`${API_URL}/${menuId}/dishes`, { data: { dishIds } });
        
        // Invalidate cache for specific menu
        requestCache.invalidate(`${API_URL}/${menuId}`);
        requestCache.invalidateByPrefix(API_URL);
        
        // Refetch the menu with updated dishes
        return await this.getById(menuId, true);
      } catch (error) {
        console.error(`Error removing dishes from menu ${menuId}:`, error);
        // Return the current menu even if the API call fails
        return currentMenu;
      }
    } catch (error) {
      console.error(`Error fetching menu ${menuId} before removing dishes:`, error);
      throw error;
    }
  },

  /**
   * Get the main menu (menu đang là menu chính)
   */
  async getMain(): Promise<MenuModel | null> {
    try {
      const response = await axios.get(API_URL, { params: { is_main: true } });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching main menu:', error);
      return null;
    }
  }
};
