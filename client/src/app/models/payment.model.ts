import { OrderModel } from './order.model';

export interface PaymentModel {
  id: string;
  order_id: string;
  order?: OrderModel;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  method: 'vnpay' | 'cash';
  transaction_id?: string;
  error?: string;
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

export interface CreatePaymentDto {
  orderId: string;
  amount: number;
  method: 'vnpay' | 'cash';
}

export interface PaymentHistoryParams {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}
