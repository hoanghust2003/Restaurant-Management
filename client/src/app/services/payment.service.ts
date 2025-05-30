import axios from 'axios';
import { CreatePaymentDto, PaymentModel, PaymentHistoryParams } from '../models/payment.model';

const API_URL = '/api/payment';

export interface PrintReceiptDto {
  orderId: string;
  paymentId: string;
  printedBy: string;
  printedAt: Date;
}

class PaymentService {
  /**
   * Create a new payment for an order
   */
  async createPayment(data: CreatePaymentDto): Promise<{ paymentUrl?: string }> {
    const response = await axios.post(`${API_URL}/create-payment`, data);
    return response.data;
  }

  /**
   * Get payment status by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentModel> {
    const response = await axios.get(`${API_URL}/order/${orderId}`);
    return response.data;
  }

  /**
   * Get payment history with filters
   */
  async getPaymentHistory(params?: PaymentHistoryParams): Promise<PaymentModel[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) {
      queryParams.append('startDate', params.startDate.toISOString());
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate.toISOString());
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }

    const response = await axios.get(`${API_URL}/history?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Complete a cash payment
   */
  async completeCashPayment(orderId: string): Promise<PaymentModel> {
    const response = await axios.post(`${API_URL}/complete-cash-payment/${orderId}`);
    return response.data;
  }

  /**
   * Verify VNPay return URL
   */
  async verifyVNPayReturn(queryParams: Record<string, string>): Promise<PaymentModel> {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axios.get(`${API_URL}/vnpay-return?${queryString}`);
    return response.data;
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, reason: string): Promise<PaymentModel> {
    const response = await axios.post(`${API_URL}/refund/${paymentId}`, { reason });
    return response.data;
  }

  /**
   * Record a receipt print
   */
  async recordReceiptPrint(data: PrintReceiptDto): Promise<void> {
    try {
      await axios.post(`${API_URL}/print-receipt`, data);
    } catch (error) {
      console.error('Error recording receipt print:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
