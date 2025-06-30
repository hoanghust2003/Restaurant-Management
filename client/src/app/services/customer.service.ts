import axios from '../utils/axios';
import { TableModel } from '../models/table.model';

const API_URL = '/customer';

export const customerService = {
  /**
   * Get table details by ID
   * @param tableId - The ID of the table to retrieve
   */
  async getTableById(tableId: string): Promise<TableModel> {
    const response = await axios.get(`${API_URL}/tables/${tableId}`);
    return response.data;
  },

  /**
   * Get all available tables for customer selection
   * @returns List of available tables
   */
  async getAvailableTables(): Promise<TableModel[]> {
    const response = await axios.get(`${API_URL}/tables`);
    return response.data;
  },

  /**
   * Create a new order as a customer
   */
  async createOrder(data: {
    tableId: string;
    items: Array<{
      dishId: string;
      quantity: number;
      note?: string;
    }>;
  }): Promise<any> {
    const response = await axios.post(`${API_URL}/orders`, data);
    return response.data;
  },

  /**
   * Get QR code for a table
   * @param tableId - The ID of the table to get a QR code for
   */
  async getTableQrCode(tableId: string): Promise<{
    qrCode: string;
    url: string;
    table: {
      id: string;
      name: string;
      capacity: number;
    };
  }> {
    const response = await axios.get(`${API_URL}/tables/${tableId}/qr-code`);
    return response.data;
  },
};
