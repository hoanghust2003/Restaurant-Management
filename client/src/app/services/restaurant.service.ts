import axios from '../utils/axios';
import { RestaurantModel, CreateRestaurantDto, UpdateRestaurantDto } from '../models/restaurant.model';

const API_URL = '/restaurants';

// Keep a local memory cache with timestamp to reduce network requests on problematic networks
let memoryCache = {
  restaurantInfo: null as RestaurantModel | null,
  timestamp: 0,
  failedAttempts: 0,
  lastError: null as Error | null
};

// Set a maximum number of API failures before we stop trying (reset after success)
const MAX_CONSECUTIVE_FAILURES = 3;

// Set a minimum time between retries when experiencing connection issues
const MIN_RETRY_INTERVAL = 30000; // 30 seconds

// Helper function to check if URLs are valid
const isValidUrl = (urlString: string): boolean => {
  try {
    if (!urlString) return false;
    if (urlString.startsWith('/')) return true; // Local URL
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

/**
 * Service for handling restaurant operations
 */
export const restaurantService = {  
  /**
   * Get restaurant information with smart caching and failure handling
   * @param forceRefresh - Force a fresh fetch from server, bypassing cache
   */  
  async getRestaurantInfo(forceRefresh = false): Promise<RestaurantModel> {
    const now = Date.now();
    
    // If we have hit max failures and it's been less than retry interval, use cache
    if (
      memoryCache.failedAttempts >= MAX_CONSECUTIVE_FAILURES && 
      !forceRefresh &&
      (now - memoryCache.timestamp) < MIN_RETRY_INTERVAL
    ) {
      if (memoryCache.restaurantInfo) {
        console.log('Using memory cache due to previous API failures');
        return memoryCache.restaurantInfo;
      }
      
      if (memoryCache.lastError) {
        throw memoryCache.lastError;
      }
    }
    
    try {
      // Configure request options
      const config = {
        headers: forceRefresh ? { 'x-skip-cache': 'true' } : undefined,
        timeout: 3000 // Shorter timeout for better UX
      };
      
      const response = await axios.get(`${API_URL}/info`, config);
      if (response.data && response.data.data) {
        const restaurant = response.data.data;
        
        // Validate and fix image URLs
        if (restaurant.logo_url) {
          if (!isValidUrl(restaurant.logo_url)) {
            console.warn('Invalid logo URL format:', restaurant.logo_url);
            restaurant.logo_url = undefined;
          }
        }
        
        if (restaurant.cover_image_url) {
          if (!isValidUrl(restaurant.cover_image_url)) {
            console.warn('Invalid cover image URL format:', restaurant.cover_image_url);
            restaurant.cover_image_url = undefined;
          }
        }
        
        // Update memory cache
        memoryCache = {
          restaurantInfo: restaurant,
          timestamp: now,
          failedAttempts: 0, // Reset failure count on success
          lastError: null
        };
        
        return restaurant;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching restaurant information:', error);
      
      // Update failure count
      memoryCache.failedAttempts++;
      memoryCache.lastError = error instanceof Error ? error : new Error('Unknown error fetching restaurant info');
      
      // If we have cached data, return it on error
      if (memoryCache.restaurantInfo) {
        return memoryCache.restaurantInfo;
      }
      
      throw error;
    }
  },

  /**
   * Get all restaurants
   */
  async getAll(): Promise<RestaurantModel[]> {
    try {
      const response = await axios.get(API_URL);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },

  /**
   * Get a specific restaurant by ID
   */
  async getById(id: string): Promise<RestaurantModel> {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  },

  /**
   * Create a new restaurant
   */
  async create(restaurant: CreateRestaurantDto): Promise<RestaurantModel> {
    try {
      const response = await axios.post(API_URL, restaurant);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  },

  /**
   * Update an existing restaurant
   */
  async update(id: string, restaurant: UpdateRestaurantDto): Promise<RestaurantModel> {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, restaurant);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  },

  /**
   * Delete a restaurant
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
  }
};
