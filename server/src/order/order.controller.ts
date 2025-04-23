import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderGateway } from './order.gateway';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderGateway: OrderGateway,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req): Promise<Order> {
    // Create the order using the service
    const userId = req.user?.userId || 1; // Sử dụng userId từ người dùng đăng nhập hoặc giá trị mặc định
    const order = await this.orderService.create(createOrderDto, userId);
    
    // Notify connected kitchen clients about the new order
    this.orderGateway.notifyNewOrder(order);
    
    return order;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get('pending')
  @UseGuards(AuthGuard('jwt'))
  findPending(): Promise<Order[]> {
    return this.orderService.findPendingOrders();
  }

  @Get('table/:tableId')
  findByTable(@Param('tableId', ParseUUIDPipe) tableId: string): Promise<Order[]> {
    return this.orderService.findByTable(tableId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
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
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const updatedOrder = await this.orderService.updateStatus(id, updateOrderStatusDto.status);
    this.orderGateway.notifyOrderStatusUpdated(updatedOrder);
    return updatedOrder;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.orderService.remove(id);
    return { message: 'Order deleted successfully' };
  }
}