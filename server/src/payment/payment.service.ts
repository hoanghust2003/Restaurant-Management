import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PrintReceiptDto } from './dto/print-receipt.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(data: Partial<Payment>) {
    const payment = this.paymentRepository.create(data);
    return await this.paymentRepository.save(payment);
  }

  async updatePayment(orderId: string, data: Partial<Payment>) {
    const payment = await this.paymentRepository.findOne({ where: { orderId }});
    if (payment) {
      Object.assign(payment, data);
      return await this.paymentRepository.save(payment);
    }
    return null;
  }

  async findByOrderId(orderId: string) {
    return await this.paymentRepository.findOne({ where: { orderId }});
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
