import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderGateway } from './order.gateway';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderGateway: OrderGateway,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    // Create the order using the service
    const order = await this.orderService.create(createOrderDto);
    
    // Notify connected kitchen clients about the new order
    this.orderGateway.notifyNewOrder(order);
    
    return order;
  }

  @Get()
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get('pending')
  findPending(): Promise<Order[]> {
    return this.orderService.findPendingOrders();
  }

  @Get('table/:tableId')
  findByTable(@Param('tableId', ParseIntPipe) tableId: number): Promise<Order[]> {
    return this.orderService.findByTable(tableId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const updatedOrder = await this.orderService.update(id, updateOrderDto);
    
    // If status was updated, notify through WebSockets
    if (updateOrderDto.status) {
      this.orderGateway.notifyOrderStatusUpdated(updatedOrder);
    }
    
    return updatedOrder;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const updatedOrder = await this.orderService.updateStatus(id, updateOrderStatusDto.status);
    this.orderGateway.notifyOrderStatusUpdated(updatedOrder);
    return updatedOrder;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.orderService.remove(id);
    return { message: 'Order deleted successfully' };
  }
}