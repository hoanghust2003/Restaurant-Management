import axios from '../utils/axios';
import { OrderModel, CreateOrderDto, UpdateOrderDto } from '../models/order.model';
import { OrderStatus, OrderItemStatus } from '../utils/enums';

const API_URL = '/orders';

export const orderService = {
  /**
   * Lấy tất cả đơn hàng với các bộ lọc tùy chọn
   */
  async getAll(filters?: {
    status?: OrderStatus;
    tableId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OrderModel[]> {
    const response = await axios.get(API_URL, { params: filters });
    return response.data;
  },

  /**
   * Lấy tất cả đơn hàng cho bếp (chỉ lấy những đơn đang chờ và đang chuẩn bị)
   */
  async getKitchenOrders(): Promise<OrderModel[]> {
    const kitchenStatuses = [
      OrderStatus.PENDING,
      OrderStatus.IN_PROGRESS,
      OrderStatus.READY
    ].join(',');
    
    const response = await axios.get(`${API_URL}/kitchen`, {
      params: { statuses: kitchenStatuses }
    });
    return response.data;
  },

  /**
   * Lấy tất cả đơn hàng cho bếp (chỉ lấy những đơn đang chờ và đang chuẩn bị)
   */
  async getKitchenOrders(): Promise<OrderModel[]> {
    const kitchenStatuses = [
      OrderStatus.PENDING,
      OrderStatus.PREPARING,
      OrderStatus.READY
    ].join(',');
    
    const response = await axios.get(`${API_URL}/kitchen`, {
      params: { statuses: kitchenStatuses }
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
   * Lấy đơn hàng đang hoạt động của một bàn
   */
  async getActiveByTable(tableId: string): Promise<OrderModel | null> {
    try {
      const response = await axios.get(`${API_URL}/table/${tableId}/active`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Tạo mới đơn hàng
   */
  async create(order: CreateOrderDto): Promise<OrderModel> {
    const response = await axios.post(API_URL, order);
    return response.data;
  },

  /**
   * Cập nhật đơn hàng
   */
  async update(id: string, order: UpdateOrderDto): Promise<OrderModel> {
    const response = await axios.patch(`${API_URL}/${id}`, order);
    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */  async updateStatus(id: string, status: OrderStatus): Promise<OrderModel> {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status });
    return response.data;
  },

  /**
   * Cập nhật trạng thái một món trong đơn hàng
   */
  async updateOrderItem(orderId: string, itemId: string, update: { status: OrderItemStatus }): Promise<OrderModel> {
    const response = await axios.patch(`${API_URL}/${orderId}/items/${itemId}`, update);
    return response.data;
  },

  /**
   * Cập nhật thông tin đơn hàng (bao gồm trạng thái)
   */
  async updateOrder(orderId: string, update: { status: OrderStatus }): Promise<OrderModel> {
    const response = await axios.patch(`${API_URL}/${orderId}`, update);
    return response.data;
  },

  /**
   * Hủy đơn hàng
   */
  async cancel(id: string): Promise<void> {
    await axios.patch(`${API_URL}/${id}/status`, { status: OrderStatus.CANCELED });
  },
  
  /**
   * Cập nhật trạng thái của một món trong đơn hàng
   */
  async updateOrderItemStatus(orderId: string, itemId: string, status: OrderItemStatus): Promise<OrderModel> {
    const response = await axios.patch(`${API_URL}/${orderId}/items/${itemId}/status`, { status });
    return response.data;
  },
  
  /**
   * Lấy tất cả đơn hàng đang hoạt động (chưa hoàn thành hoặc hủy)
   */
  async getActive(): Promise<OrderModel[]> {
    const activeStatuses = [
      OrderStatus.PENDING, 
      OrderStatus.IN_PROGRESS, 
      OrderStatus.READY, 
      OrderStatus.SERVED
    ].join(',');
    
    const response = await axios.get(`${API_URL}/active`, {
      params: { statuses: activeStatuses }
    });
    return response.data;
  },
};
