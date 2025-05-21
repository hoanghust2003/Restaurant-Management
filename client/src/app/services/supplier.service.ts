import axios from '../utils/axios';
import { SupplierModel, CreateSupplierDto, UpdateSupplierDto } from '../models/supplier.model';
import { requestCache } from '../utils/requestCache';

// Định nghĩa các endpoint
const API_URL = '/suppliers';

/**
 * Service xử lý các thao tác CRUD với nhà cung cấp
 */
export const supplierService = {
  /**
   * Lấy tất cả nhà cung cấp
   * @param includeDeleted - true để bao gồm cả nhà cung cấp đã xóa tạm thời
   */
  async getAll(includeDeleted = false): Promise<SupplierModel[]> {
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
    const filteredData = includeDeleted ? data : data.filter((item: SupplierModel) => !item.deleted_at);
    
    requestCache.set(url, filteredData);
    return filteredData;
  },

  /**
   * Lấy chi tiết một nhà cung cấp
   * @param id - ID của nhà cung cấp
   * @param includeDeleted - true để bao gồm cả nhà cung cấp đã xóa tạm thời
   */
  async getById(id: string, includeDeleted = false): Promise<SupplierModel> {
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
   * Tạo mới nhà cung cấp
   */
  async create(supplier: CreateSupplierDto): Promise<SupplierModel> {
    const response = await axios.post(API_URL, supplier);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    return response.data;
  },

  /**
   * Cập nhật nhà cung cấp
   */
  async update(id: string, supplier: UpdateSupplierDto): Promise<SupplierModel> {
    const response = await axios.patch(`${API_URL}/${id}`, supplier);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    requestCache.invalidate(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Xóa tạm thời nhà cung cấp (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    await axios.delete(`${API_URL}/${id}`);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    requestCache.invalidate(`${API_URL}/${id}`);
    return true;
  },

  /**
   * Khôi phục nhà cung cấp đã xóa tạm thời
   */
  async restore(id: string): Promise<SupplierModel> {
    const response = await axios.post(`${API_URL}/${id}/restore`);
    // Xóa cache khi có thay đổi dữ liệu
    requestCache.invalidateByPrefix(API_URL);
    requestCache.invalidate(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách nhà cung cấp đã xóa tạm thời
   */
  async getDeleted(): Promise<SupplierModel[]> {
    const url = `${API_URL}?includeDeleted=true`;
    
    const cachedResult = requestCache.get(`${url}_deleted_only`);
    if (cachedResult) {
      return cachedResult;
    }

    const response = await axios.get(url);
    const deletedItems = response.data.filter((item: SupplierModel) => item.deleted_at);
    
    requestCache.set(`${url}_deleted_only`, deletedItems);
    return deletedItems;
  }
};
