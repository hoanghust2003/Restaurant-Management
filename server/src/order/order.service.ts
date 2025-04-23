import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, In, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem, OrderItemStatus } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MenuItem } from '../menu-item/entities/menu-item.entity';
import { MenuItemIngredient } from '../menu-item/entities/menu-item-ingredient.entity';
import { Dish } from '../menu-item/entities/dish.entity';
import { Table, TableStatus } from '../table/entities/table.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { TransactionType } from '../inventory/entities/transaction-type.enum';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
    @InjectRepository(MenuItemIngredient)
    private menuItemIngredientRepository: Repository<MenuItemIngredient>,
    @InjectRepository(InventoryTransaction)
    private inventoryTransactionRepository: Repository<InventoryTransaction>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
    private dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string | number = 1): Promise<Order> {
    // Bắt đầu transaction để đảm bảo tính nhất quán dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the table
      const table = await this.tableRepository.findOne({ 
        where: { id: String(createOrderDto.tableId) } 
      });
      
      if (!table) {
        throw new NotFoundException(`Table with ID ${createOrderDto.tableId} not found`);
      }

      // Create the order
      const order = this.orderRepository.create({
        table: table,
        specialInstructions: createOrderDto.specialInstructions,
        customerId: createOrderDto.customerId || undefined,
        status: OrderStatus.PENDING,
        totalAmount: 0
      });

      // Save the order to get an ID
      const savedOrder = await queryRunner.manager.save(order);

      // Create order items
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
        // Kiểm tra nếu đang sử dụng menu item cũ hoặc dish mới
        if (item.menuItemId) {
          // Logic cũ với MenuItem
          const menuItem = await this.menuItemRepository.findOne({ 
            where: { id: item.menuItemId },
            relations: ['ingredients', 'ingredients.ingredient'],
          });
          
          if (!menuItem) {
            throw new NotFoundException(`Menu item with ID ${item.menuItemId} not found`);
          }

          // Kiểm tra xem món có sẵn không
          if (!menuItem.isAvailable) {
            throw new BadRequestException(`Menu item ${menuItem.name} is currently not available`);
          }

          // Create order item
          const orderItem = this.orderItemRepository.create({
            orderId: savedOrder.id,
            menuItemId: menuItem.id,
            quantity: item.quantity,
            price: menuItem.price,
            notes: item.notes || item.note,
            status: OrderItemStatus.PENDING
          });

          // Save order item
          const savedOrderItem = await queryRunner.manager.save(orderItem);
          orderItems.push(savedOrderItem);

          // Calculate total
          totalAmount += menuItem.price * item.quantity;
        } 
        else if (item.dishId) {
          // Logic mới với Dish
          const dish = await this.dishRepository.findOne({ 
            where: { id: item.dishId },
            relations: ['dishIngredients', 'dishIngredients.ingredient'],
          });
          
          if (!dish) {
            throw new NotFoundException(`Dish with ID ${item.dishId} not found`);
          }

          // Kiểm tra xem món có sẵn không
          if (!dish.is_available) {
            throw new BadRequestException(`Dish ${dish.name} is currently not available`);
          }

          // Create order item
          const orderItem = this.orderItemRepository.create({
            orderId: savedOrder.id,
            dishId: dish.id,
            quantity: item.quantity,
            price: dish.price,
            notes: item.notes || item.note,
            status: OrderItemStatus.PENDING
          });

          // Save order item
          const savedOrderItem = await queryRunner.manager.save(orderItem);
          orderItems.push(savedOrderItem);

          // Calculate total
          totalAmount += dish.price * item.quantity;
        } else {
          throw new BadRequestException('Either menuItemId or dishId must be provided for order items');
        }
      }

      // Update the order with items and total amount
      savedOrder.items = orderItems;
      savedOrder.totalAmount = totalAmount;
      
      // Update table status to occupied
      table.status = TableStatus.OCCUPIED;
      await queryRunner.manager.save(table);

      const finalOrder = await queryRunner.manager.save(savedOrder);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      return finalOrder;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release queryRunner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['table', 'items', 'items.menuItem', 'items.dish'],
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ 
      where: { id },
      relations: ['table', 'items', 'items.menuItem', 'items.dish'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByTable(tableId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { tableId },
      relations: ['items', 'items.menuItem', 'items.dish'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      where: [
        { status: OrderStatus.PENDING },
        { status: OrderStatus.IN_PROGRESS },
      ],
      relations: ['table', 'items', 'items.menuItem', 'items.dish'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
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

  async updateStatus(id: string | number, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: String(id) } });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
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

      // If no other active orders for this table, set table as cleaning
      if (activeOrders === 0) {
        const table = await this.tableRepository.findOne({ where: { id: String(order.tableId) } });
        if (table) {
          table.status = TableStatus.CLEANING;
          await this.tableRepository.save(table);
        }
      }
    }

    return this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}