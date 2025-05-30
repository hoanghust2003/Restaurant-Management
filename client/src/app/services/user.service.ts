import axios from '../utils/axios';
import { requestCache } from '../utils/requestCache';
import { UserModel, CreateUserDto, UpdateUserDto, ChangePasswordDto } from '../models/user.model';

const API_URL = '/users';

/**
 * Service xử lý các thao tác với người dùng
 */
export const userService = {
  /**
   * Lấy tất cả người dùng
   * @param includeDeleted - true để bao gồm cả người dùng đã xóa tạm thời
   */
  async getAll(includeDeleted = false): Promise<UserModel[]> {
    const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
    
    // Sử dụng cache để cải thiện hiệu suất
    const cachedResult = requestCache.get(url);
    if (cachedResult) {
      return cachedResult;
    }
    
    const response = await axios.get(url);
    const data = response.data;
    
    requestCache.set(url, data);
    return data;
  },

  /**
   * Lấy chi tiết một người dùng
   * @param id - ID của người dùng
   * @param includeDeleted - true để bao gồm cả người dùng đã xóa tạm thời
   */
  async getById(id: string, includeDeleted = false): Promise<UserModel> {
    const url = includeDeleted ? `${API_URL}/${id}?includeDeleted=true` : `${API_URL}/${id}`;
    
    // Kiểm tra cache trước
    const cachedData = requestCache.get(url);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(url);
    requestCache.set(url, response.data);
    
    return response.data;
  },

  /**
   * Tạo mới người dùng
   */
  async create(userData: CreateUserDto): Promise<UserModel> {
    const response = await axios.post(API_URL, userData);
    
    // Xóa cache cũ khi có thay đổi
    requestCache.invalidateByPrefix(API_URL);
    
    return response.data;
  },

  /**
   * Cập nhật thông tin người dùng
   */
  async update(id: string, userData: UpdateUserDto): Promise<UserModel> {
    const response = await axios.put(`${API_URL}/${id}`, userData);
    
    // Xóa cache cũ khi có thay đổi
    requestCache.invalidateByPrefix(API_URL);
    
    return response.data;
  },

  /**
   * Xóa người dùng
   */
  async delete(id: string): Promise<boolean> {
    await axios.delete(`${API_URL}/${id}`);
    
    // Xóa cache cũ khi có thay đổi
    requestCache.invalidateByPrefix(API_URL);
    
    return true;
  },

  /**
   * Khôi phục người dùng đã xóa tạm thời
   */
  async restore(id: string): Promise<UserModel> {
    const response = await axios.patch(`${API_URL}/${id}/restore`);
    
    // Xóa cache cũ khi có thay đổi
    requestCache.invalidateByPrefix(API_URL);
    
    return response.data;
  },

  /**
   * Cập nhật mật khẩu người dùng
   */
  async changePassword(id: string, passwordData: ChangePasswordDto): Promise<boolean> {
    await axios.post(`${API_URL}/${id}/change-password`, passwordData);
    return true;
  }
};
