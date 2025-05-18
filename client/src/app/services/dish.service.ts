import axiosInstance from '../utils/axios';
import { DishModel, CreateDishDto, UpdateDishDto } from '../models/dish.model';

// Định nghĩa các endpoint
const API_URL = '/dishes';

/**
 * Service xử lý các thao tác CRUD với món ăn
 */
export const dishService = {
  /**
   * Lấy tất cả món ăn
   * @param includeDeleted - true để bao gồm cả món ăn đã xóa tạm thời
   */
  async getAll(includeDeleted = false): Promise<DishModel[]> {
    const url = includeDeleted ? `${API_URL}?includeDeleted=true` : API_URL;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Lấy chi tiết một món ăn
   * @param id - ID của món ăn
   * @param includeDeleted - true để bao gồm cả món ăn đã xóa tạm thời
   */
  async getById(id: string, includeDeleted = false): Promise<DishModel> {
    const url = includeDeleted ? `${API_URL}/${id}?includeDeleted=true` : `${API_URL}/${id}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Tạo mới món ăn
   */
  async create(dish: CreateDishDto): Promise<DishModel> {
    const response = await axiosInstance.post(API_URL, dish);
    return response.data;
  },

  /**
   * Cập nhật món ăn
   */
  async update(id: string, dish: UpdateDishDto): Promise<DishModel> {
    const response = await axiosInstance.patch(`${API_URL}/${id}`, dish);
    return response.data;
  },

  /**
   * Xóa tạm thời món ăn (soft delete)
   */
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${API_URL}/${id}`);
  },

  /**
   * Khôi phục món ăn đã xóa tạm thời
   */
  async restore(id: string): Promise<DishModel> {
    const response = await axiosInstance.post(`${API_URL}/${id}/restore`);
    return response.data;
  },

  /**
   * Xóa vĩnh viễn món ăn
   */
  async hardDelete(id: string): Promise<void> {
    await axiosInstance.delete(`${API_URL}/${id}/hard`);
  },

  /**
   * Lấy danh sách món ăn đã xóa tạm thời
   */
  async getDeleted(): Promise<DishModel[]> {
    return this.getAll(true).then(dishes => dishes.filter(dish => dish.deleted_at));
  }
};
