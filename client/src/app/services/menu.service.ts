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
      const response = await axios.post(API_URL, menu);
      
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
      const response = await axios.patch(`${API_URL}/${id}`, menu);
      
      // Invalidate cache for specific menu and menu list
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
      const response = await axios.post(`${API_URL}/${menuId}/dishes`, { dishIds });
      
      // Invalidate cache for specific menu
      requestCache.invalidate(`${API_URL}/${menuId}`);
      
      return response.data;
    } catch (error) {
      console.error(`Error adding dishes to menu ${menuId}:`, error);
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
      const response = await axios.delete(`${API_URL}/${menuId}/dishes`, { data: { dishIds } });
      
      // Invalidate cache for specific menu
      requestCache.invalidate(`${API_URL}/${menuId}`);
      
      return response.data;
    } catch (error) {
      console.error(`Error removing dishes from menu ${menuId}:`, error);
      throw error;
    }
  }
};
