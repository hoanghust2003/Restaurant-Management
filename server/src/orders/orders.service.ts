import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { TableEntity } from '../entities/table.entity';
import { Dish } from '../entities/dish.entity';
import { OrderStatus, OrderItemStatus } from '../enums/order-status.enum';
import { OrderWithItems } from './interfaces/order-with-items.interface';
import { EventsGateway } from '../events/events.gateway';
import { KitchenGateway } from '../kitchen/kitchen.gateway';

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
    @Inject(forwardRef(() => EventsGateway)) 
    private eventsGateway: EventsGateway,
    @Inject(forwardRef(() => KitchenGateway)) 
    private kitchenGateway: KitchenGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderWithItems> {
    // Validate table exists
    const table = await this.tableRepository.findOne({
      where: { id: createOrderDto.tableId },
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${createOrderDto.tableId} not found`);
    }
    
    // BỎ QUA: Kiểm tra bàn có đơn hàng đang hoạt động không
    // const activeOrder = await this.orderRepository.findOne({
    //   where: {
    //     tableId: createOrderDto.tableId,
    //     status: In([OrderStatus.PENDING, OrderStatus.IN_PROGRESS]),
    //   },
    // });

    // if (activeOrder) {
    //   throw new BadRequestException(`Table ${table.name} already has an active order`);
    // }

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
    }
    // Create order
    const order = this.orderRepository.create({
      tableId: createOrderDto.tableId,
      userId: createOrderDto.userId, // Sẽ được cung cấp từ createCustomerOrder
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
        status: OrderItemStatus.WAITING, // Mặc định là WAITING
      });

      const savedOrderItem = await this.orderItemRepository.save(orderItem);
      orderItems.push(savedOrderItem);
    }

    const orderWithItems = { ...savedOrder, items: orderItems } as OrderWithItems;
    // Notify all subscribers about new order
    this.eventsGateway.notifyNewOrder(orderWithItems);
    // Notify kitchen specifically
    this.kitchenGateway.notifyNewOrder(orderWithItems);

    return orderWithItems;
  }
  async findAll(filters?: { 
    status?: string; 
    tableId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OrderWithItems[]> {
    try {
      const queryBuilder = this.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.table', 'table')
        .leftJoinAndSelect('order.user', 'user');

      if (filters) {
        if (filters.status) {
          // Handle multiple statuses
          const statuses = filters.status.split(',').map(s => s.trim());
          // Validate that all statuses are valid
          for (const status of statuses) {
            if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
              throw new BadRequestException(`Invalid status: ${status}`);
            }
          }
          queryBuilder.andWhere('order.status IN (:...statuses)', { statuses });
        }

        if (filters.tableId) {
          // Validate UUID format for tableId
          if (!this.isValidUUID(filters.tableId)) {
            throw new BadRequestException(`Invalid table ID format: ${filters.tableId}`);
          }
          queryBuilder.andWhere('order.tableId = :tableId', { tableId: filters.tableId });
        }

        if (filters.startDate && filters.endDate) {
          queryBuilder.andWhere('order.created_at BETWEEN :startDate AND :endDate', {
            startDate: new Date(filters.startDate),
            endDate: new Date(filters.endDate),
          });
        }
      }

      queryBuilder.orderBy('order.created_at', 'DESC');

      const orders = await queryBuilder.getMany();

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await this.orderItemRepository.find({
            where: { orderId: order.id },
            relations: ['dish'],
          });
          return { ...order, items } as OrderWithItems;
        })
      );

      return ordersWithItems;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error fetching orders: ${error.message}`);
    }
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

    await this.orderRepository.update(id, { status: status as OrderStatus });    const updatedOrder = await this.findOne(id);
    
    // Notify customer about order status change
    this.eventsGateway.notifyOrderStatusChange(updatedOrder);
    // Notify kitchen about order status change
    this.kitchenGateway.notifyOrderUpdate(id, status as OrderStatus);

    return updatedOrder;
  }

  async updateItemStatus(orderId: string, itemId: string, status: OrderItemStatus): Promise<OrderWithItems> {
    const order = await this.findOne(orderId);
    const item = order.items.find(i => i.id === itemId);

    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found in order ${orderId}`);
    }    await this.orderItemRepository.update(itemId, { status });
    
    // Notify customer about item status change
    this.eventsGateway.notifyOrderItemStatusChange(orderId, {
      itemId: Number(itemId),
      status
    });
    // Notify kitchen about item status change
    this.kitchenGateway.notifyOrderItemUpdate(orderId, itemId, status);

    return this.findOne(orderId);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    
    // Delete order items first
    await this.orderItemRepository.delete({ orderId: id });
    
    // Then delete the order
    await this.orderRepository.delete(id);
  }

  async createCustomerOrder(createOrderDto: any): Promise<OrderWithItems> {
    try {
      // Validate table
      const table = await this.tableRepository.findOne({
        where: { id: createOrderDto.tableId },
      });
      
      if (!table) {
        throw new NotFoundException(`Table with ID ${createOrderDto.tableId} not found`);
      }
      
      // Create order
      const order = this.orderRepository.create({
        tableId: createOrderDto.tableId,
        status: OrderStatus.PENDING,
        total_price: 0,
        // Leave userId null for customer orders
      });

      const savedOrder = await this.orderRepository.save(order);
      
      // Create order items
      const orderItems: OrderItem[] = [];
      let totalPrice = 0;
      
      for (const item of createOrderDto.items) {
        const dish = await this.dishRepository.findOne({
          where: { id: item.dishId },
        });
        
        if (!dish) {
          throw new NotFoundException(`Dish with ID ${item.dishId} not found`);
        }

        const orderItem = this.orderItemRepository.create({
          orderId: savedOrder.id,
          dishId: item.dishId,
          quantity: item.quantity,
          note: item.note,
          status: OrderItemStatus.WAITING
        });

        const savedItem = await this.orderItemRepository.save(orderItem);
        orderItems.push(savedItem);
        
        totalPrice += dish.price * item.quantity;
      }

      // Update total price
      await this.orderRepository.update(savedOrder.id, {
        total_price: totalPrice
      });

      const orderWithItems = { 
        ...savedOrder, 
        items: orderItems, 
        total_price: totalPrice 
      } as OrderWithItems;

      // Notify kitchen
      this.kitchenGateway.notifyNewOrder(orderWithItems);
      // Notify all subscribers
      this.eventsGateway.notifyNewOrder(orderWithItems);

      return orderWithItems;
    } catch (error) {
      console.error('Error in createCustomerOrder:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}
