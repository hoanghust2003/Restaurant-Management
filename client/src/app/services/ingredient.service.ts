import axios from '../utils/axios';
import { IngredientModel, CreateIngredientDto, UpdateIngredientDto } from '../models/ingredient.model';
import { requestCache } from '../utils/requestCache';

// Định nghĩa các endpoint
const API_URL = '/ingredients';

/**
 * Service xử lý các thao tác CRUD với nguyên liệu
 */
export const ingredientService = {  /**
   * Lấy tất cả nguyên liệu
   * @param includeDeleted - true để bao gồm cả nguyên liệu đã xóa tạm thời
   */
  async getAll(includeDeleted = false): Promise<IngredientModel[]> {
    // Tạo cache key có tính đến tham số includeDeleted
    const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
    
    // Tạm thời tắt cache để debug
    // const cachedResult = requestCache.get(url);
    // if (cachedResult) {
    //   return cachedResult;
    // }

    const response = await axios.get(url);
    const data = response.data;
    
    console.log('Raw API response for ingredients:', data); // Debug log
    
    // Nếu includeDeleted=true, trả về tất cả, nếu không, lọc bỏ các bản ghi đã xóa
    const filteredData = includeDeleted ? data : data.filter((item: IngredientModel) => !item.deleted_at);
    
    // requestCache.set(url, filteredData); // Tạm thời tắt cache
    return filteredData;
  },

  /**
   * Lấy chi tiết một nguyên liệu
   * @param id - ID của nguyên liệu
   * @param includeDeleted - true để bao gồm cả nguyên liệu đã xóa tạm thời
   */
  async getById(id: string, includeDeleted = false): Promise<IngredientModel> {
    const url = includeDeleted ? `${API_URL}/${id}?includeDeleted=true` : `${API_URL}/${id}`;
    const cachedResult = requestCache.get(url);
    if (cachedResult) {
      return cachedResult;
    }

    const response = await axios.get(url);
    requestCache.set(url, response.data);
    return response.data;
  },

  /**
   * Tạo mới nguyên liệu
   */
  async create(ingredient: CreateIngredientDto): Promise<IngredientModel> {
    const response = await axios.post(API_URL, ingredient);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    return response.data;
  },

  /**
   * Cập nhật nguyên liệu
   */
  async update(id: string, ingredient: UpdateIngredientDto): Promise<IngredientModel> {
    const response = await axios.patch(`${API_URL}/${id}`, ingredient);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    requestCache.invalidate(`${API_URL}/${id}`);
    return response.data;
  },
  /**
   * Xóa tạm thời nguyên liệu (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    await axios.delete(`${API_URL}/${id}`);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    requestCache.invalidate(`${API_URL}/${id}`);
    return true;
  },

  /**
   * Khôi phục nguyên liệu đã xóa tạm thời
   */
  async restore(id: string): Promise<IngredientModel> {
    const response = await axios.post(`${API_URL}/${id}/restore`);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    requestCache.invalidate(`${API_URL}/${id}`);
    return response.data;
  },
  /**
   * Lấy danh sách nguyên liệu đã xóa tạm thời
   */
  async getDeleted(): Promise<IngredientModel[]> {
    const url = `${API_URL}?includeDeleted=true`;
    
    const cachedResult = requestCache.get(`${url}_deleted_only`);
    if (cachedResult) {
      return cachedResult;
    }

    const response = await axios.get(url);
    const deletedItems = response.data.filter((item: IngredientModel) => item.deleted_at);
    
    requestCache.set(`${url}_deleted_only`, deletedItems);
    return deletedItems;
  },

  /**
   * Lấy danh sách nguyên liệu có số lượng dưới ngưỡng tối thiểu
   */
  async getLowStock(): Promise<any[]> {
    try {
      const url = `${API_URL}/low-stock`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.log('Using mock data for low stock ingredients');
      return [
        { id: '1', name: 'Cà chua', available_quantity: 2, min_quantity: 5, unit: 'kg' },
        { id: '2', name: 'Hành tây', available_quantity: 1, min_quantity: 3, unit: 'kg' },
        { id: '3', name: 'Ớt chuông', available_quantity: 0.5, min_quantity: 2, unit: 'kg' },
        { id: '4', name: 'Thịt bò', available_quantity: 1.2, min_quantity: 3, unit: 'kg' },
        { id: '5', name: 'Tỏi', available_quantity: 0.3, min_quantity: 1, unit: 'kg' }
      ];
    }
  }
};
