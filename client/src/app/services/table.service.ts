import { BaseService } from './base.service';
import { TableModel, CreateTableDto, UpdateTableDto } from '../models/table.model';
import axios from '../utils/axios';
import { requestCache } from '../utils/requestCache';

class TableService extends BaseService<TableModel> {
  constructor() {
    super('/tables');
  }
  /**
   * Lấy tất cả bàn
   * @param config - Cấu hình cho request (includeDeleted để bao gồm cả bàn đã xóa tạm thời)
   */
  async getAll(config: { includeDeleted?: boolean } = {}): Promise<TableModel[]> {
    const includeDeleted = config.includeDeleted || false;
    const url = includeDeleted ? `${this.apiUrl}?includeDeleted=true` : this.apiUrl;
    const response = await axios.get(url);
    return response.data;
  }

  /**
   * Lấy chi tiết một bàn
   */
  async getById(id: string, config: { includeDeleted?: boolean } = {}): Promise<TableModel> {
    const includeDeleted = config.includeDeleted || false;
    const url = includeDeleted ? `${this.apiUrl}/${id}?includeDeleted=true` : `${this.apiUrl}/${id}`;
    const response = await axios.get(url);
    return response.data;
  }
  /**
   * Tạo mới bàn
   */
  async create(table: CreateTableDto): Promise<TableModel> {
    const response = await axios.post(this.apiUrl, table);
    // Cập nhật cache sau khi tạo mới
    requestCache.invalidateByPrefix(this.apiUrl);
    return response.data;
  }
  /**
   * Cập nhật bàn
   */
  async update(id: string, table: UpdateTableDto): Promise<TableModel> {
    const response = await axios.put(`${this.apiUrl}/${id}`, table);
    // Cập nhật cache sau khi cập nhật
    requestCache.invalidateByPrefix(this.apiUrl);
    requestCache.invalidate(`${this.apiUrl}/${id}`);
    return response.data;
  }
  /**
   * Xóa bàn
   */
  async delete(id: string): Promise<void> {
    await axios.delete(`${this.apiUrl}/${id}`);
    // Cập nhật cache sau khi xóa
    requestCache.invalidateByPrefix(this.apiUrl);
    requestCache.invalidate(`${this.apiUrl}/${id}`);
  }
  /**
   * Cập nhật trạng thái bàn
   */
  async updateStatus(tableId: string, status: string): Promise<TableModel> {
    try {
      const response = await axios.patch(`${this.apiUrl}/${tableId}/status`, { status });
      // Cập nhật cache sau khi cập nhật trạng thái
      requestCache.invalidateByPrefix(this.apiUrl);
      requestCache.invalidate(`${this.apiUrl}/${tableId}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating table ${tableId} status:`, error);
      throw error;
    }
  }  /**
   * Khôi phục bàn đã xóa
   */
  async restore(id: string): Promise<TableModel> {
    const response = await axios.post(`${this.apiUrl}/${id}/restore`);
    // Cập nhật cache sau khi khôi phục
    requestCache.invalidateByPrefix(this.apiUrl);
    requestCache.invalidate(`${this.apiUrl}/${id}`);
    return response.data;
  }
  /**
   * Tạo QR code cho bàn
   */
  async generateQrCode(id: string): Promise<{
    tableId: string;
    tableName: string;
    qrCode: string;
    menuUrl: string;
    metadata?: {
      generatedAt: string;
      expiresAt?: string;
      size: number;
      format: string;
    };
  }> {
    try {
      const response = await axios.get(`${this.apiUrl}/${id}/qr-code`);
      console.log('QR code response:', response.data);
      
      // Ensure we have all the required fields
      if (!response.data.qrCode) {
        console.error('QR code response missing qrCode field');
        throw new Error('QR code data is missing');
      }
      
      // Transform the response to match our client-side interface
      return {
        tableId: response.data.table?.id || id,
        tableName: response.data.table?.name || 'Unknown',
        qrCode: response.data.qrCode,
        menuUrl: response.data.url || `${window.location.origin}/customer/menu?tableId=${id}`,
        metadata: response.data.metadata
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
}

export const tableService = new TableService();
