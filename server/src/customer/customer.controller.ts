import { Controller, Post, Body, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from '../orders/orders.service';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto';
import { TablesService } from '../tables/tables.service';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly tablesService: TablesService,
  ) {}

  @Post('orders')
  @ApiOperation({ summary: 'Create a new order from customer' })
  @ApiResponse({ status: 201, description: 'The order has been successfully created.' })
  createOrder(@Body() createOrderDto: CreateCustomerOrderDto) {
    return this.ordersService.createCustomerOrder(createOrderDto);
  }

  @Get('tables/:id')
  @ApiOperation({ summary: 'Get table information' })
  @ApiResponse({ status: 200, description: 'Return the table information.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  getTable(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.findOne(id);
  }

  @Get('tables/:id/qr-code')
  @ApiOperation({ summary: 'Get table QR code' })
  @ApiResponse({ status: 200, description: 'Return the QR code for the table.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  getTableQrCode(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.generateQrCode(id);
  }
}
