import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { OrderStatus } from '../../enums/order-status.enum';
import { TableEntity as Table } from '../../entities/table.entity';
import { TableStatus } from '../../enums/table-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORDER_EVENTS } from '../../events/order.events';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async completeOrderPayment(orderId: string): Promise<Order> {
    this.logger.log(`Completing payment for order ${orderId}`);
    
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['table']
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.COMPLETED) {
      return order; // Already completed
    }

    order.status = OrderStatus.COMPLETED;
    order.updated_at = new Date(); // Update the last modified timestamp

    // Update table status if order is completed
    if (order.table) {
      order.table.status = TableStatus.CLEANING;
      await this.tableRepository.save(order.table);
    }

    const updatedOrder = await this.orderRepository.save(order);

    // Emit order status updated event
    this.eventEmitter.emit(ORDER_EVENTS.ORDER_STATUS_UPDATED, {
      orderId: order.id,
      status: OrderStatus.COMPLETED
    });

    return updatedOrder;
  }
}
