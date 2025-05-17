import axios from '../utils/axios';
import { CategoryModel } from '../models/category.model';
import { requestCache } from '../utils/requestCache';

// Định nghĩa các endpoint
const API_URL = '/categories';

/**
 * Service xử lý các thao tác CRUD với danh mục món ăn
 */
export const categoryService = {
  /**
   * Lấy tất cả danh mục
   */
  async getAll(): Promise<CategoryModel[]> {
    const response = await axios.get(API_URL);
    return response.data;
  },

  /**
   * Lấy chi tiết một danh mục
   */
  async getById(id: string): Promise<CategoryModel> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
  /**
   * Tạo mới danh mục
   */
  async create(category: Omit<CategoryModel, 'id'>): Promise<CategoryModel> {
    const response = await axios.post(API_URL, category);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    return response.data;
  },

  /**
   * Cập nhật danh mục
   */
  async update(id: string, category: Partial<CategoryModel>): Promise<CategoryModel> {
    const response = await axios.patch(`${API_URL}/${id}`, category);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    requestCache.invalidate(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Xóa danh mục
   */
  async delete(id: string): Promise<boolean> {
    await axios.delete(`${API_URL}/${id}`);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    requestCache.invalidate(`${API_URL}/${id}`);
    return true;
  }
};
