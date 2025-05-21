import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
// Use absolute path to resolve the import issue
import { UpdateOrderDto } from '../orders/dto/update-order.dto';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { TableEntity } from '../entities/table.entity';
import { Dish } from '../entities/dish.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderItemStatus } from '../enums/order-item-status.enum';
import { OrderWithItems } from './interfaces/order-with-items.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(TableEntity)
    private tableRepository: Repository<TableEntity>,
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderWithItems> {
    // Validate table exists
    const table = await this.tableRepository.findOne({
      where: { id: createOrderDto.tableId },
    });
      if (!table) {
      throw new NotFoundException(`Table with ID ${createOrderDto.tableId} not found`);
    }
    
    // Check if table already has an active order
    const activeOrder = await this.orderRepository.findOne({
      where: {
        tableId: createOrderDto.tableId,
        status: In([OrderStatus.PENDING, OrderStatus.IN_PROGRESS]),
      },
    });

    if (activeOrder) {
      throw new BadRequestException(`Table ${table.name} already has an active order`);
    }

    // Calculate total price
    let totalPrice = 0;
    
    for (const item of createOrderDto.items) {
      const dish = await this.dishRepository.findOne({
        where: { id: item.dishId },
      });
      
      if (!dish) {
        throw new NotFoundException(`Dish with ID ${item.dishId} not found`);
      }
      
      totalPrice += dish.price * item.quantity;
    }    // Create order
    const order = this.orderRepository.create({
      tableId: createOrderDto.tableId,
      userId: createOrderDto.userId,
      status: OrderStatus.PENDING,
      total_price: totalPrice,
    });
    
    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    const orderItems: OrderItem[] = [];
    for (const item of createOrderDto.items) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        dishId: item.dishId,
        quantity: item.quantity,
        note: item.note,
        status: OrderItemStatus.WAITING,
      });

      const savedOrderItem = await this.orderItemRepository.save(orderItem);
      orderItems.push(savedOrderItem);
    }

    return { ...savedOrder, items: orderItems } as OrderWithItems;
  }
  async findAll(filters?: { 
    status?: string; 
    tableId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OrderWithItems[]> {
    const query: any = {};    if (filters?.status) {
      if (filters.status.includes(',')) {
        const statuses = filters.status.split(',');
        query.status = In(statuses);
      } else {
        query.status = filters.status;
      }
    }

    if (filters?.tableId) {
      query.tableId = filters.tableId;
    }

    if (filters?.startDate && filters?.endDate) {
      query.created_at = Between(
        new Date(filters.startDate),
        new Date(filters.endDate)
      );
    }

    const orders = await this.orderRepository.find({
      where: query,
      relations: ['table', 'user'],
      order: { created_at: 'DESC' },
    });

    // Get items for each order
    const ordersWithItems: OrderWithItems[] = [];
    for (const order of orders) {
      const orderItems = await this.orderItemRepository.find({
        where: { orderId: order.id },
        relations: ['dish'],
      });
      
      ordersWithItems.push({ ...order, items: orderItems } as OrderWithItems);
    }

    return ordersWithItems;
  }  async findOne(id: string): Promise<OrderWithItems> {
    // Validate UUID format before querying to prevent database errors
    if (!this.isValidUUID(id)) {
      throw new BadRequestException(`Invalid order ID format: ${id}. Must be a valid UUID.`);
    }

    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['table', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Get order items
    const orderItems = await this.orderItemRepository.find({
      where: { orderId: id },
      relations: ['dish'],
    });

    return { ...order, items: orderItems } as OrderWithItems;
  }
  
  // Utility function to validate UUID format
  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }async findActiveByTable(tableId: string): Promise<OrderWithItems | null> {
    // Use In operator to check for multiple possible statuses
    const order = await this.orderRepository.findOne({
      where: {
        tableId,
        status: In([OrderStatus.PENDING, OrderStatus.IN_PROGRESS]),
      },
      relations: ['table', 'user'],
    });

    if (!order) {
      return null;
    }

    // Get order items
    const orderItems = await this.orderItemRepository.find({
      where: { orderId: order.id },
      relations: ['dish'],
    });

    return { ...order, items: orderItems } as OrderWithItems;
  }
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderWithItems> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELED) {
      throw new BadRequestException(`Cannot update a ${order.status} order`);
    }

    // Add new items if any
    if (updateOrderDto.items && updateOrderDto.items.length > 0) {
      let totalPrice = order.total_price;

      for (const item of updateOrderDto.items) {
        if (item.id) {
          // Update existing item
          await this.orderItemRepository.update(item.id, {
            quantity: item.quantity,
            note: item.note,
          });
        } else {
          // Create new item
          const dish = await this.dishRepository.findOne({
            where: { id: item.dishId },
          });
          
          if (!dish) {
            throw new NotFoundException(`Dish with ID ${item.dishId} not found`);
          }

          const orderItem = this.orderItemRepository.create({
            orderId: id,
            dishId: item.dishId,
            quantity: item.quantity,
            note: item.note,
            status: OrderItemStatus.WAITING,
          });

          await this.orderItemRepository.save(orderItem);
          
          totalPrice += dish.price * item.quantity;
        }
      }

      // Update total price
      await this.orderRepository.update(id, { total_price: totalPrice });
    }

    // Remove items if any
    if (updateOrderDto.removedItems && updateOrderDto.removedItems.length > 0) {
      for (const itemId of updateOrderDto.removedItems) {
        const item = await this.orderItemRepository.findOne({
          where: { id: itemId },
          relations: ['dish'],
        });

        if (item) {
          // Update total price
          const newTotalPrice = order.total_price - (item.dish.price * item.quantity);
          await this.orderRepository.update(id, { total_price: newTotalPrice });
          
          // Delete item
          await this.orderItemRepository.delete(itemId);
        }
      }
    }

    return this.findOne(id);
  }
  async updateStatus(id: string, status: string): Promise<OrderWithItems> {
    const order = await this.findOne(id);

    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    await this.orderRepository.update(id, { status: status as OrderStatus });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    
    // Delete order items first
    await this.orderItemRepository.delete({ orderId: id });
    
    // Then delete the order
    await this.orderRepository.delete(id);
  }
}
