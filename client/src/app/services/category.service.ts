import axios from '../utils/axios';
import { CategoryModel } from '../models/category.model';
import { requestCache } from '../utils/requestCache';

// Định nghĩa các endpoint
const API_URL = '/categories';

/**
 * Service xử lý các thao tác CRUD với danh mục món ăn
 */
export const categoryService = {  /**
   * Lấy tất cả danh mục
   * @param includeDeleted - true để bao gồm cả danh mục đã xóa tạm thời
   */
  async getAll(includeDeleted = false): Promise<CategoryModel[]> {
    // Tạo cache key có tính đến tham số includeDeleted
    const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
    
    // Sử dụng cache để cải thiện hiệu suất
    const cachedResult = requestCache.get(url);
    if (cachedResult) {
      return cachedResult;
    }

    const response = await axios.get(url);
    const data = response.data;
    
    // Nếu includeDeleted=true, trả về tất cả, nếu không, lọc bỏ các bản ghi đã xóa
    const filteredData = includeDeleted ? data : data.filter((item: CategoryModel) => !item.deleted_at);
    
    requestCache.set(url, filteredData);
    return filteredData;
  },

  /**
   * Lấy chi tiết một danh mục
   * @param id - ID của danh mục
   * @param includeDeleted - true để bao gồm cả danh mục đã xóa tạm thời
   */
  async getById(id: string, includeDeleted = false): Promise<CategoryModel> {
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
   * Xóa tạm thời danh mục (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    await axios.delete(`${API_URL}/${id}`);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    requestCache.invalidate(`${API_URL}/${id}`);
    return true;
  },

  /**
   * Khôi phục danh mục đã xóa tạm thời
   */
  async restore(id: string): Promise<CategoryModel> {
    const response = await axios.post(`${API_URL}/${id}/restore`);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    requestCache.invalidate(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách danh mục đã xóa tạm thời
   */
  async getDeleted(): Promise<CategoryModel[]> {
    const url = `${API_URL}?includeDeleted=true`;
    
    const cachedResult = requestCache.get(`${url}_deleted_only`);
    if (cachedResult) {
      return cachedResult;
    }

    const response = await axios.get(url);
    const deletedItems = response.data.filter((item: CategoryModel) => item.deleted_at);
    
    requestCache.set(`${url}_deleted_only`, deletedItems);
    return deletedItems;
  }
};
