import axios from '../utils/axios';
import { OrderModel } from '../models/order.model';
import { OrderStatus } from '../utils/enums';

const API_URL = '/orders';

export const orderService = {
  /**
   * Lấy tất cả đơn hàng
   */
  async getAll(includeDeleted = false): Promise<OrderModel[]> {
    const response = await axios.get(API_URL, {
      params: { includeDeleted }
    });
    return response.data;
  },

  /**
   * Lấy chi tiết một đơn hàng
   */
  async getById(id: string): Promise<OrderModel> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Tạo mới đơn hàng
   */
  async create(order: any): Promise<OrderModel> {
    const response = await axios.post(API_URL, order);
    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateStatus(id: string, status: OrderStatus): Promise<OrderModel> {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status });
    return response.data;
  },

  /**
   * Hủy đơn hàng
   */
  async cancel(id: string): Promise<void> {
    await axios.post(`${API_URL}/${id}/cancel`);
  },
};
