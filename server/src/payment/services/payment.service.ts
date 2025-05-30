import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from '../entities/payment.entity';
import { FinancialRecord } from '../../entities/financial-record.entity';
import { FinancialRecordType } from '../../enums/financial-record-type.enum';
import { VnpayService } from './vnpay.service';
import { OrdersService } from '../../orders/orders.service';

import { PrintReceiptDto } from '../dto/print-receipt.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(FinancialRecord)
    private readonly financialRecordRepository: Repository<FinancialRecord>,    private readonly vnpayService: VnpayService,    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService,
  ) {}

  async createPayment(orderId: string, amount: number, method: PaymentMethod): Promise<Payment> {
    const payment = this.paymentRepository.create({
      orderId,
      amount,
      method,
      status: PaymentStatus.PENDING
    });

    return await this.paymentRepository.save(payment);
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    return await this.paymentRepository.findOne({ where: { orderId } });
  }

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    return await this.paymentRepository.findOne({ where: { id: paymentId } });
  }

  async updatePaymentStatus(
    paymentId: string, 
    status: PaymentStatus, 
    transactionId?: string,
    error?: string
  ): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = status;
    if (transactionId) {
      payment.transactionId = transactionId;
    }
    if (error) {
      payment.error = error;
    }
    if (status === PaymentStatus.COMPLETED) {
      payment.completed_at = new Date();
      await this.createFinancialRecord(payment);
    }

    return await this.paymentRepository.save(payment);
  }

  private async createFinancialRecord(payment: Payment): Promise<void> {
    const financialRecord = this.financialRecordRepository.create({
      type: FinancialRecordType.INCOME,
      amount: payment.amount,
      description: `Payment received for order #${payment.orderId} via ${payment.method}`,
      relatedOrderId: payment.orderId
    });

    await this.financialRecordRepository.save(financialRecord);
  }

  // Get VNPay payment URL
  async createVNPayUrl(orderId: string, amount: number, ipAddr: string): Promise<string> {
    // Create payment record first
    const payment = await this.createPayment(orderId, amount, PaymentMethod.VNPAY);
    
    // Store payment metadata for verification
    const metadata = {
      paymentId: payment.id,
      orderId,
      amount,
    };
    
    payment.metadata = metadata;
    await this.paymentRepository.save(payment);
    
    // Get VNPay payment URL
    return this.vnpayService.createPaymentUrl(
      amount,
      payment.id, // Use payment ID as VNPay order ID
      `Payment for order ${orderId}`,
      ipAddr
    );
  }
  // Verify VNPay return
  async verifyVNPayReturn(params: Record<string, string>): Promise<{
    success: boolean;
    message: string;
    data?: {
      orderId: string;
      amount: number;
      transactionId: string;
    };
  }> {
    try {
      // Verify the return from VNPay
      const isValid = this.vnpayService.verifyReturnUrl(params);
      if (!isValid) {
        throw new Error('Invalid payment verification');
      }

      const paymentId = params.vnp_TxnRef;
      const payment = await this.getPaymentById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Check payment amount
      const returnedAmount = Number(params.vnp_Amount) / 100; // VNPay amount is in VND x 100
      if (returnedAmount !== payment.amount) {
        throw new Error('Payment amount mismatch');
      }

      // Update payment status based on VNPay response
      const responseCode = params.vnp_ResponseCode;
      const transactionId = params.vnp_TransactionNo;

      if (responseCode === '00') {
        // Payment successful
        await this.updatePaymentStatus(paymentId, PaymentStatus.COMPLETED, transactionId);
        
        // Update order status
        await this.orderService.completeOrderPayment(payment.orderId);

        return {
          success: true,
          message: 'Payment successful',
          data: {
            orderId: payment.orderId,
            amount: payment.amount,
            transactionId
          }
        };
      } else {
        // Payment failed
        await this.updatePaymentStatus(
          paymentId, 
          PaymentStatus.FAILED, 
          transactionId,
          `VNPay error code: ${responseCode}`
        );

        return {
          success: false,
          message: 'Payment failed',
        };
      }
    } catch (error) {
      this.logger.error('Error verifying VNPay return:', error);
      throw error;
    }
  }
  // Get payment history with filters
  async getPaymentHistory(filters: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .orderBy('payment.created_at', 'DESC');

    if (filters.startDate) {    query.andWhere('payment.created_at >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('payment.created_at <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    return await query.getMany();
  }

  async recordReceiptPrint(printReceiptDto: PrintReceiptDto): Promise<void> {
    try {
      this.logger.log(`Recording receipt print for order ${printReceiptDto.orderId}`);
      
      // TODO: Save receipt print record to database when needed
      // For now, we'll just log it
      this.logger.log({
        message: 'Receipt printed',
        ...printReceiptDto
      });
    } catch (error) {
      this.logger.error(`Error recording receipt print: ${error.message}`, error.stack);
      throw error;
    }
  }
}
