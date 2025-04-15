import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, In } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MenuItem } from '../menu-item/entities/menu-item.entity';
import { Table, TableStatus } from '../table/entities/table.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Find the table
    const table = await this.tableRepository.findOne({ 
      where: { id: createOrderDto.tableId } 
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${createOrderDto.tableId} not found`);
    }

    // Create the order
    const order = this.orderRepository.create({
      tableId: table.id,
      specialInstructions: createOrderDto.specialInstructions,
    });

    // Save the order to get an ID
    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of createOrderDto.items) {
      const menuItem = await this.menuItemRepository.findOne({ 
        where: { id: item.menuItemId } 
      });
      if (!menuItem) {
        throw new NotFoundException(`Menu item with ID ${item.menuItemId} not found`);
      }

      // Create order item
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        menuItemId: menuItem.id,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes,
      });

      // Save order item
      const savedOrderItem = await this.orderItemRepository.save(orderItem);
      orderItems.push(savedOrderItem);

      // Calculate total
      totalAmount += menuItem.price * item.quantity;
    }

    // Update the order with items and total amount
    savedOrder.items = orderItems;
    savedOrder.totalAmount = totalAmount;
    
    // Update table status to occupied
    table.status = TableStatus.OCCUPIED;
    await this.tableRepository.save(table);

    return this.orderRepository.save(savedOrder);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['table', 'items', 'items.menuItem'],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ 
      where: { id },
      relations: ['table', 'items', 'items.menuItem'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByTable(tableId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { tableId },
      relations: ['items', 'items.menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      where: [
        { status: OrderStatus.PENDING },
        { status: OrderStatus.IN_PROGRESS },
      ],
      relations: ['table', 'items', 'items.menuItem'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // Update order fields
    if (updateOrderDto.status !== undefined) {
      order.status = updateOrderDto.status;
    }

    if (updateOrderDto.specialInstructions !== undefined) {
      order.specialInstructions = updateOrderDto.specialInstructions;
    }

    return this.orderRepository.save(order);
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;

    // If order is completed or canceled, update table status
    if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELED) {
      const activeOrders = await this.orderRepository.count({
        where: {
          tableId: order.tableId,
          id: Not(order.id),
          status: Not(In([OrderStatus.COMPLETED, OrderStatus.CANCELED])),
        },
      });

      // If no other active orders for this table, set table as available
      if (activeOrders === 0) {
        const table = await this.tableRepository.findOne({ where: { id: order.tableId } });
        if (table) {
          table.status = TableStatus.CLEANING;
          await this.tableRepository.save(table);
        }
      }
    }

    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}