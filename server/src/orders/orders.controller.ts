import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { UpdateOrderDto } from '../orders/dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';
import { OrderStatus } from '../enums/order-status.enum';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Post()
  @Roles(UserRole.WAITER, UserRole.CASHIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'The order has been successfully created.' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }  @Get()
  @Roles(UserRole.WAITER, UserRole.CASHIER, UserRole.CHEF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all orders with optional filters' })
  @ApiResponse({ status: 200, description: 'Return all orders.' })
  findAll(
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ordersService.findAll({ status, tableId, startDate, endDate });
  }

  @Get('active')
  @Roles(UserRole.WAITER, UserRole.CASHIER, UserRole.CHEF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all active orders' })
  @ApiResponse({ status: 200, description: 'Return all active orders.' })
  findActive(@Query('statuses') statuses?: string) {
    const statusArray = statuses ? statuses.split(',') : [
      OrderStatus.PENDING, 
      OrderStatus.IN_PROGRESS, 
      OrderStatus.READY, 
      OrderStatus.SERVED
    ];
    
    return this.ordersService.findAll({ status: statusArray.join(',') });
  }
  
  @Get('table/:tableId/active')
  @Roles(UserRole.WAITER, UserRole.CASHIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get active order by table id' })
  @ApiResponse({ status: 200, description: 'Return the active order for a table.' })
  findActiveByTable(@Param('tableId') tableId: string) {
    return this.ordersService.findActiveByTable(tableId);
  }
  
  @Get(':id')
  @Roles(UserRole.WAITER, UserRole.CASHIER, UserRole.CHEF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({ status: 200, description: 'Return the order.' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
  @Patch(':id')
  @Roles(UserRole.WAITER, UserRole.CASHIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: 200, description: 'The order has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }
  @Patch(':id/status')
  @Roles(UserRole.WAITER, UserRole.CASHIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'The order status has been successfully updated.' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({ status: 200, description: 'The order has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
