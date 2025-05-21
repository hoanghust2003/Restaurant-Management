import axios from '../utils/axios';
import { requestCache } from '../utils/requestCache';

export abstract class BaseService<T> {
  constructor(protected apiUrl: string) {}

  async getAll(includeDeleted = false): Promise<T[]> {
    const cacheKey = `${this.apiUrl}?includeDeleted=${includeDeleted}`;
    
    try {
      // Check cache first
      const cachedData = requestCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      const params = includeDeleted ? { includeDeleted: 'true' } : {};
      const response = await axios.get(this.apiUrl, { params });
      
      requestCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${this.apiUrl}:`, error);
      throw error;
    }
  }

  async getById(id: string, includeDeleted = false): Promise<T> {
    const cacheKey = `${this.apiUrl}/${id}?includeDeleted=${includeDeleted}`;
    
    try {
      const cachedData = requestCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      const params = includeDeleted ? { includeDeleted: 'true' } : {};
      const response = await axios.get(`${this.apiUrl}/${id}`, { params });
      
      requestCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${this.apiUrl}/${id}:`, error);
      throw error;
    }
  }

  async create(data: any): Promise<T> {
    try {
      const response = await axios.post(this.apiUrl, data);
      requestCache.invalidateByPrefix(this.apiUrl);
      return response.data;
    } catch (error) {
      console.error(`Error creating ${this.apiUrl}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any): Promise<T> {
    try {
      const response = await axios.patch(`${this.apiUrl}/${id}`, data);
      requestCache.invalidateByPrefix(this.apiUrl);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${this.apiUrl}/${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/${id}`);
      requestCache.invalidateByPrefix(this.apiUrl);
    } catch (error) {
      console.error(`Error deleting ${this.apiUrl}/${id}:`, error);
      throw error;
    }
  }

  async restore(id: string): Promise<T> {
    try {
      const response = await axios.post(`${this.apiUrl}/${id}/restore`);
      requestCache.invalidateByPrefix(this.apiUrl);
      return response.data;
    } catch (error) {
      console.error(`Error restoring ${this.apiUrl}/${id}:`, error);
      throw error;
    }
  }
}
