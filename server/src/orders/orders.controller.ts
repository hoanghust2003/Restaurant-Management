import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { UpdateOrderDto } from '../orders/dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { ParseUUIDPipe } from '@nestjs/common/pipes';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  
  @Post()
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'The order has been successfully created.' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }
  
  @Get()
  @Roles(UserRole.STAFF, UserRole.CHEF, UserRole.ADMIN)
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

  @Get('active-orders')
  @Roles(UserRole.STAFF, UserRole.CHEF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all active orders' })
  @ApiResponse({ status: 200, description: 'Return all active orders.' })
  @ApiResponse({ status: 400, description: 'Invalid status value.' })
  findActive(@Query('statuses') statuses?: string) {
    const statusArray = statuses ? statuses.split(',') : [
      OrderStatus.PENDING,
      OrderStatus.IN_PROGRESS,
      OrderStatus.READY,
      OrderStatus.SERVED
    ];

    // Validate all statuses before proceeding
    for (const status of statusArray) {
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        throw new BadRequestException(`Invalid status: ${status}`);
      }
    }
    
    return this.ordersService.findAll({ status: statusArray.join(',') });
  }

  @Get('table/:tableId/active')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get active order by table id' })
  @ApiResponse({ status: 200, description: 'Return the active order for the table.' })
  @ApiResponse({ status: 400, description: 'Invalid table ID.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  findActiveByTable(@Param('tableId', ParseUUIDPipe) tableId: string) {
    return this.ordersService.findActiveByTable(tableId);
  }

  @Get(':id')
  @Roles(UserRole.STAFF, UserRole.CHEF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({ status: 200, description: 'Return the order.' })
  @ApiResponse({ status: 400, description: 'Invalid order ID.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: 200, description: 'The order has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid order ID or update data.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'The order status has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid order ID or status.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
  
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({ status: 200, description: 'The order has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Invalid order ID.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
